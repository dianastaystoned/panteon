import { pool } from "../db.js";
import ExcelJS from 'exceljs';

export const renderCustomers = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM difunto");
  res.render("difunto", { difunto: rows });
};

export const createCustomers = async (req, res) => {
  const newDifunto = req.body;
  await pool.query("INSERT INTO difunto set ?", [newDifunto]);
  res.redirect("/");
};

export const editCustomer = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query("SELECT * FROM difunto WHERE id = ?", [
    id,
  ]);
  res.render("difunto_edit", { difunto: result[0] });
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const newCustomer = req.body;
  await pool.query("UPDATE difunto set ? WHERE id = ?", [newCustomer, id]);
  res.redirect("/");
};

export const deleteCustomer = async (req, res) => {
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
    { header: 'ID', key: 'id' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Sección', key: 'seccion' },
    { header: 'Fecha', key: 'fecha' }
  ];

  worksheet.addRows(rows);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=difuntos.xlsx');

  await workbook.xlsx.write(res);
  res.end();
}
