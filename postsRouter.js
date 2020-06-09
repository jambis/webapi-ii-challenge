const router = require("express").Router();
const db = require("./data/db");

router.get("/", (req, res) => {
  db.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

router.get("/:id", (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      post.length > 0
        ? res.status(200).json(post)
        : res.status(404).json({
            message: "The post with the specified ID does not exist."
          });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." });
    });
});

router.get("/:id/comments", (req, res) => {
  db.findPostComments(req.params.id)
    .then(comment => {
      comment.length > 0
        ? res.status(200).json(comment)
        : db
            .findById(req.params.id)
            .then(post => {
              if (post.length > 0) {
                res.status(404).json({
                  message:
                    "The post with the specified ID does not contain comments."
                });
              } else {
                res.status(404).json({
                  message: "The post with the specified ID does not exist."
                });
              }
            })
            .catch(err => {
              res.status(500).json({
                error: "The post information could not be retrieved."
              });
            });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." });
    });
});

router.post("/", (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res.status(400).json({
      errorMessage: "Please provide title and contents for the post."
    });
  } else {
    db.insert({ title: req.body.title, contents: req.body.contents })
      .then(post => {
        db.findById(post.id)
          .then(postBody => res.status(201).json(postBody))
          .catch(err =>
            res.status(500).json({
              error: "There was an error while saving the post to the database"
            })
          );
      })
      .catch(err =>
        res.status(500).json({
          error: "There was an error while saving the post to the database"
        })
      );
  }
});

router.post("/:id/comments", (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      if (post.length > 0) {
        if (!req.body.text) {
          res
            .status(400)
            .json({ errorMessage: "Please provide text for the comment." });
        } else {
          db.insertComment({ text: req.body.text, post_id: req.params.id })
            .then(commentId =>
              db
                .findCommentById(commentId.id)
                .then(comment => res.status(201).json(comment))
                .catch(err =>
                  res.status(500).json({
                    error: "The post information could not be retrieved."
                  })
                )
            )
            .catch(err =>
              res
                .status(500)
                .json({ error: "The post information could not be retrieved." })
            );
        }
      } else {
        res.status(404).json({
          message: "The post with the specified ID does not exist."
        });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." });
    });
});

router.delete("/:id", (req, res) => {
  db.remove(req.params.id)
    .then(deleted => {
      deleted
        ? res.status(202).json({ message: "Post Deleted" })
        : res.status(404).json({
            message: "The post with the specified ID does not exist."
          });
    })
    .catch(err => {
      res.status(500).json({ error: "The post could not be removed" });
    });
});

router.put("/:id", (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      if (post.length > 0) {
        if (!req.body.title || !req.body.contents) {
          res.status(400).json({
            errorMessage: "Please provide title and contents for the post."
          });
        } else {
          db.update(req.params.id, {
            title: req.body.title,
            contents: req.body.contents
          })
            .then(updated => {
              db.findById(req.params.id)
                .then(post => res.status(200).json(post))
                .catch(err => {
                  res.status(500).json({
                    error: "The post information could not be modified."
                  });
                });
            })
            .catch(err => {
              res
                .status(500)
                .json({ error: "The post information could not be modified." });
            });
        }
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "The post information could not be modified." });
    });
});

module.exports = router;
