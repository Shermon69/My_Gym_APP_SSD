const Payment = require("./../models/payments");

exports.addPayment = async (req, res) => {
  try {
    const pay = await Payment.create({
      member: req.body.member,
      sportType: req.body.sportType,
      months: req.body.months,
      credit: req.body.credit,
      date: new Date(),
      // amount is NOT set by the client. It must be calculated server-side or set by an admin through a separate, protected endpoint.
    });
    res.status(200).send("added");
  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).send({ error: "Failed to add payment" });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const pays = await Payment.find().populate("member").populate("sportType");
    console.log(pays);

    res.send(pays);
  } catch (err) {
    console.log(err);
  }
};
