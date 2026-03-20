var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
let {
  RegisterValidator,
  handleResultValidator,
  changePasswordValidator,
} = require("../utils/validatorHandler");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let { checkLogin } = require("../utils/authHandler");
let fs = require("fs");
let path = require("path");

// Đọc khóa Private để Sign Token
const privateKey = fs.readFileSync(
  path.join(__dirname, "../private.pem"),
  "utf8",
);

/* GET home page. */
router.post(
  "/register",
  RegisterValidator,
  handleResultValidator,
  async function (req, res, next) {
    let newUser = userController.CreateAnUser(
      req.body.username,
      req.body.password,
      req.body.email,
      "69aa8360450df994c1ce6c4c", // Note: ID role này bạn đang cứng, nhớ kiểm tra lại nếu cần
    );
    await newUser.save();
    res.send({
      message: "dang ki thanh cong",
    });
  },
);

router.post("/login", async function (req, res, next) {
  let { username, password } = req.body;
  let getUser = await userController.FindByUsername(username);
  if (!getUser) {
    res.status(403).send("tai khoan khong ton tai");
  } else {
    if (getUser.lockTime && getUser.lockTime > Date.now()) {
      res.status(403).send("tai khoan dang bi ban");
      return;
    }
    if (bcrypt.compareSync(password, getUser.password)) {
      await userController.SuccessLogin(getUser);

      // Chuyển sang dùng privateKey và thuật toán RS256
      let token = jwt.sign({ id: getUser._id }, privateKey, {
        algorithm: "RS256",
        expiresIn: "30d",
      });
      res.send({ token: token }); // Trả về dạng JSON để dễ lấy
    } else {
      await userController.FailLogin(getUser);
      res.status(403).send("thong tin dang nhap khong dung");
    }
  }
});

router.get("/me", checkLogin, function (req, res, next) {
  res.send(req.user);
});

// ROUTE ĐỔI MẬT KHẨU
router.post(
  "/change-password",
  checkLogin,
  changePasswordValidator,
  handleResultValidator,
  async function (req, res, next) {
    let { oldPassword, newPassword } = req.body;
    let user = req.user; // Lấy user từ middleware checkLogin

    // 1. Kiểm tra mật khẩu cũ có đúng không
    if (!bcrypt.compareSync(oldPassword, user.password)) {
      return res.status(400).send("mat khau cu khong chinh xac");
    }

    // 2. Gán mật khẩu mới (Mongoose middleware pre('save') sẽ tự động hash)
    user.password = newPassword;

    await user.save();

    res.send({
      message: "doi mat khau thanh cong",
    });
  },
);

module.exports = router;
