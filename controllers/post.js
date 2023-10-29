exports.afterUploadImage = (req, res) => {
  res.json({ url: `/img/${req.file.filename}` });
};

exports.uploadPost = (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    next(error);
  }
};
