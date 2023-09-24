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
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              mobile: req.body.mobile,
              email: req.body.email,
              address: req.body.address,
              pin: req.body.pin,
            },
          },
        }
      );
      res.redirect("/profile");
    }else {
      const data = new Address({
        user: userData._id,
        address: [
          {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            mobile: req.body.mobile,
            email: req.body.email,
            address: req.body.address,
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
// const addShippAddress = async (req, res) => {
//   try {
//     const user = req.session.user_id;
//     const userData = await User.findOne({ _id: req.session.user_id });
//     const addressData = await Address.findOne({ user: req.session.user_id });
//     if (addressData && addressData.address.length == 1) {
//       const update = await Address.updateOne(
//         { user: user },
//         {
//           $push: {
//             address: {
//               firstname: req.body.firstname,
//               lastname: req.body.lastname,
//               mobile: req.body.mobile,
//               email: req.body.email,
//               address: req.body.address,
//               pin: req.body.pin,
//             },
//           },
//         }
//       );
//       res.redirect("/profile");
//     } else {
//       const update = await Address.updateOne(
//         { user: user },
//         {
//           $set: {
//             address: {
//               firstname: req.body.firstname,
//               lastname: req.body.lastname,
//               mobile: req.body.mobile,
//               email: req.body.email,
//               address: req.body.address,
//               pin: req.body.pin,
//             },
//           },
//         }
//       );
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(404).render("404");
//   }
// };

module.exports = {
  addAddress
};
