const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
const passport = require("passport");
dotenv.config(); //process.env

const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const passportConfig = require("./passport");
const app = express();
passportConfig();
app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", { express: app, watch: true });

sequelize
  .sync()
  .then(() => {
    console.log("데이터베이스 연결성공");
  })
  .catch((err) => {
    console.error(err);
  });

//로깅 미들웨어
app.use(morgan("dev"));
//정적파일 위치 알려줌
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
//요청에서 들어오는 json데이터를 파싱하고 req.body객체에 저장함.
app.use(express.json());
//post되는 데이터(폼같은) 데이터를 req.body에 저장
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
//passport는 세션밑에다가 해야함.
app.use(passport.initialize());
app.use(passport.session());

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
