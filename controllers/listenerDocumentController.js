const documentService = require('../services/documentService');

// POST /api/listeners/:id/documents/contract
exports.generateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { group_id, contract_number, contract_date, customer_full_name, customer_passport } = req.body;

    if (!group_id) {
      return res.status(400).json({ error: 'Требуется group_id' });
    }

    const buffer = await documentService.generateListenerContract(
      parseInt(id, 10),
      parseInt(group_id, 10),
      {
        contractNumber: contract_number,
        contractDate: contract_date,
        customerFullName: customer_full_name,
        customerPassport: customer_passport
      }
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="contract_${id}_${Date.now()}.docx"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
