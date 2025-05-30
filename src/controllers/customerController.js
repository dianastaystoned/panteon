import { pool } from "../db.js";
import ExcelJS from 'exceljs';

export const renderDifunto = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM difunto ORDER BY id DESC LIMIT 10");
  const [[{allCement}]] = await pool.query("SELECT COUNT(*) AS allCement FROM difunto");
  const [[{oldCement}]] = await pool.query("SELECT COUNT(*) AS oldCement FROM difunto WHERE panteon = 'VIEJO';");
  const [[{newCement}]] = await pool.query("SELECT COUNT(*) AS newCement FROM difunto WHERE panteon = 'NUEVO';");
  res.render("difunto", { difunto: rows, allCement, oldCement, newCement });
};

export const createDifunto = async (req, res) => {
  const { name, seccion, fecha, pisos, num, panteon } = req.body;

  // Convertir a 0 si está vacío
  const pisosValue = pisos === '' ? 0 : parseInt(pisos);
  const numValue = num === '' ? 0 : parseInt(num);

  await pool.query('INSERT INTO difunto SET ?', {
    name,
    seccion,
    fecha,
    pisos: pisosValue,
    num: numValue,
    panteon
  });

  res.redirect('/');
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
  worksheet.columns = [
    { header: 'N. de gabeta actual', key: 'id' },
    { header: 'Nombre', key: 'name' },
    { header: 'Sección', key: 'seccion' },
    { header: 'Fecha', key: 'fecha' },
    { header: 'Gabetas en el mismo piso', key: 'pisos' },
    { header: 'N. de gabeta anterior', key: 'num' },
    { header: 'Panteón al que pertenece', key: 'panteon' }
  ];

  worksheet.addRows(rows);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=difuntos.xlsx');

  await workbook.xlsx.write(res);
  res.end();
}

export const allDifuntos = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM difunto");
  res.render("allDifuntos", { difunto: rows });
};
