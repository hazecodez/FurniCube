const Address = require("../models/addressModel");
const User = require("../models/userModel");

//Address Adding
const addAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });

    const addressData = await Address.findOne({ user: req.session.user_id });

    if (addressData) {
      const update = await Address.updateOne(
        { user: user },
        {
          $set: {
            address: {
              fullname: req.body.fullname,
              mobile: req.body.mobile,
              email: req.body.email,
              houseName: req.body.houseName,
              city: req.body.city,
              state: req.body.state,
              pin: req.body.pin,
            },
          },
        }
      );
      res.redirect("/profile");
    } else {
      const data = new Address({
        user: userData._id,
        address: [
          {
            fullname: req.body.fullname,
            mobile: req.body.mobile,
            email: req.body.email,
            houseName: req.body.houseName,
            city: req.body.city,
            state: req.body.state,
            pin: req.body.pin,
          },
        ],
      });
      await data.save();
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error);
    res.status(404).render("404");
  }
};

const addMultipleAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
    // const userData = await User.findOne({ _id: user });
    const addressData = await Address.findOne({ user: req.session.user_id });
    if (addressData) {
      const updated = await Address.updateOne(
        { user: user },
        {
          $push: {
            address: {
              fullname: req.body.fullname,
              mobile: req.body.mobile,
              email: req.body.email,
              houseName: req.body.houseName,
              city: req.body.city,
              state: req.body.state,
              pin: req.body.pin,
            },
          },
        }
      );
      if (updated) {
        res.redirect("/checkOut");
      } else {
        res.redirect("/checkOut");
        console.log("not added");
      }
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//=========================REMOVE ADDRESS FROM CHECKOUT PAGE==================
const removeAddress = async (req, res) => {
  try {
    const id = req.body.id;
    await Address.updateOne(
      { user: req.session.user_id },
      { $pull: { address: { _id: id } } }
    );
    res.json({ remove: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  addAddress,
  addMultipleAddress,
  removeAddress,
};
