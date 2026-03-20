let jwt = require("jsonwebtoken");
let userController = require("../controllers/users");
let fs = require("fs");
let path = require("path");

// Đọc khóa Public để Verify Token (đảm bảo file public.pem nằm ở thư mục gốc dự án)
const publicKey = fs.readFileSync(
  path.join(__dirname, "../public.pem"),
  "utf8",
);

module.exports = {
  checkLogin: async function (req, res, next) {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer")) {
      return res.status(403).send("ban chua dang nhap");
    }
    token = token.split(" ")[1];
    try {
      // Xác thực token bằng Public Key và thuật toán RS256
      let result = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
      let user = await userController.FindById(result.id);
      if (!user) {
        res.status(403).send("ban chua dang nhap");
      } else {
        req.user = user;
        next();
      }
    } catch (error) {
      res.status(403).send("token khong hop le hoac da het han");
    }
  },
};
