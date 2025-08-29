import { pool } from "../db.js";
import ExcelJS from 'exceljs';

export const renderDifunto = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM difunto ORDER BY id DESC LIMIT 10");
  const [[{allCement}]] = await pool.query("SELECT COUNT(*) AS allCement FROM difunto");
  const [[{oldCement}]] = await pool.query("SELECT COUNT(*) AS oldCement FROM difunto WHERE panteon = 'VIEJO';");
  const [[{newCement}]] = await pool.query("SELECT COUNT(*) AS newCement FROM difunto WHERE panteon = 'NUEVO';");
  const [[{ usedCement }]] = await pool.query("SELECT COUNT(*) AS usedCement FROM difunto WHERE (name = '' OR name IS NOT NULL) AND (fecha = '' OR fecha IS NOT NULL) AND (num = '' OR num IS NOT NULL)");
  const [recentChanges] = await pool.query(`SELECT * FROM difunto WHERE name != '' AND fecha != '' AND num != '' ORDER BY updated_at DESC LIMIT 5`);
  const availableCement = allCement - usedCement;
  res.render("difunto", { difunto: rows, allCement, oldCement, newCement, availableCement, recentChanges});
};

export const renderErrDifunto = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT *
    FROM difunto
    WHERE
      name IS NULL
      OR name = ''
      OR LENGTH(TRIM(name)) <= 2
      OR name NOT LIKE '% %'
      OR fecha IS NULL
      OR TRIM(fecha) = ''
      OR NOT (fecha REGEXP '^[0-9]{2}-[0-9]{2}-[0-9]{4}$')
  `);
  res.render("errDifunto", { difunto: rows });
};

function formatearFecha(fecha) {
  if (!fecha) return '';

  // Eliminar espacios y reemplazar / por -
  const limpia = fecha.replace(/\s+/g, '').replace(/\//g, '-');

  const partes = limpia.split('-');
  if (partes.length === 3) {
    const [dia, mes, anio] = partes;
    if (dia.length <= 2 && mes.length <= 2 && anio.length === 4) {
      return `${dia.padStart(2, '0')}-${mes.padStart(2, '0')}-${anio}`;
    }
  }

  return limpia;
}

export const createDifunto = async (req, res) => {
  const { name, seccion, fecha, pisos, num, panteon } = req.body;

  const pisosValue = pisos === '' ? 0 : parseInt(pisos);
  const numValue = num === '' ? 0 : parseInt(num);
  const fechaValue = formatearFecha(fecha);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Paso 1: Asegurar que la sección exista
    await conn.query(`
      INSERT INTO contador_seccion (seccion, ultimo_act)
      VALUES (?, 0)
      ON DUPLICATE KEY UPDATE seccion = seccion
    `, [seccion]);

    // Paso 2: Actualizar contador
    await conn.query(
      'UPDATE contador_seccion SET ultimo_act = ultimo_act + 1 WHERE seccion = ?',
      [seccion]
    );

    // Paso 3: Obtener nuevo valor de act
    const [[{ ultimo_act }]] = await conn.query(
      'SELECT ultimo_act FROM contador_seccion WHERE seccion = ?',
      [seccion]
    );

    // Paso 4: Insertar difunto con el act asignado
    const [result] = await conn.query('INSERT INTO difunto SET ?', {
      name,
      seccion,
      fecha: fechaValue,
      pisos: pisosValue,
      num: numValue,
      panteon,
      act: ultimo_act
    });

    await conn.commit();

    // Paso 5: Obtener el nuevo registro insertado
    const [nuevo] = await pool.query('SELECT * FROM difunto WHERE id = ?', [result.insertId]);

    // Paso 6: Recalcular contadores
    const [[{ allCement }]] = await pool.query("SELECT COUNT(*) AS allCement FROM difunto");
    const [[{ oldCement }]] = await pool.query("SELECT COUNT(*) AS oldCement FROM difunto WHERE panteon = 'VIEJO'");
    const [[{ newCement }]] = await pool.query("SELECT COUNT(*) AS newCement FROM difunto WHERE panteon = 'NUEVO'");
    const [[{ usedCement }]] = await pool.query(`
      SELECT COUNT(*) AS usedCement
      FROM difunto
      WHERE (name != '' AND name IS NOT NULL)
        AND (fecha != '' AND fecha IS NOT NULL)
        AND (num != '' AND num IS NOT NULL)
    `);
    const availableCement = allCement - usedCement;

    // ✅ Emitir evento con Socket.IO incluyendo `act`
    const io = req.app.get("io");
    io.emit("nuevoRegistro", {
      ...nuevo[0],
      act: ultimo_act,   // 👈 aseguramos que llegue el act correcto
      allCement,
      oldCement,
      newCement,
      availableCement
    });

    // Respuesta HTTP
    res.status(200).json({
      message: 'Difunto creado',
      act: ultimo_act,
      difunto: { ...nuevo[0], act: ultimo_act }
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error al crear difunto:', error.message);
    res.status(500).json({ error: 'Error al crear difunto' });
  } finally {
    conn.release();
  }
};

export const editDifunto = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query("SELECT * FROM difunto WHERE id = ?", [id]);

  if (result.length === 0) {
    return res.status(404).json({ message: "No encontrado" });
  }

  const difunto = {
    id: result[0].id,
    name: result[0].name,
    seccion: result[0].seccion,
    fecha: result[0].fecha,
    pisos: result[0].pisos,
    num: result[0].num,
    panteon: result[0].panteon
  };
  res.json(difunto);
};


export const updateDifunto = async (req, res) => {
  const { id } = req.params;
  const newCustomer = req.body;
  await pool.query("UPDATE difunto set ? WHERE id = ?", [newCustomer, id]);
  res.redirect("/all");
};

export const deleteDifunto = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM difunto WHERE id = ?", [id]);
  if (result.affectedRows === 1) {
    res.json({ message: "Difunto deleted" });
  }
  res.redirect("/");
};

export const exportData = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM difunto");

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Difuntos');

  // Definir columnas con encabezados
  worksheet.columns = [
    { header: 'N. de gaveta actual', key: 'act', width: 20 },
    { header: 'Nombre', key: 'name', width: 30 },
    { header: 'Sección', key: 'seccion', width: 15 },
    { header: 'Fecha', key: 'fecha', width: 20 },
    { header: 'Gavetas en el mismo piso', key: 'pisos', width: 25 },
    { header: 'N. de gaveta anterior', key: 'num', width: 25 },
    { header: 'Panteón al que pertenece', key: 'panteon', width: 25 }
  ];

  // Estilos para los encabezados
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2F75B5' }, // Azul oscuro
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Agregar los datos
  worksheet.addRows(rows);

  // Estilo a todas las celdas con datos
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Saltar encabezado

    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Enviar archivo
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=difuntos.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};
export const allDifuntos = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM difunto");
  res.render("allDifuntos", { difunto: rows });
};
