const app = require("http");
const url = require("url");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminGifsicle = require("imagemin-gifsicle");
const got = require("got");

const initServer = (request, response) => {
  let requestURL = url.parse(request.url, true);

  if (requestURL.search !== null) {
    let { file, quality } = requestURL.query;
    if (quality === "") {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(
          [
            {
              error: true,
              msg: `Found quality but it need an value [quality = 1-100]`
            }
          ],
          null,
          3
        )
      );
    } else if (quality === undefined) {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(
          [
            {
              error: true,
              msg: `Require quality [ quality = 1-100 ]`
            }
          ],
          null,
          3
        )
      );
    } else if (isNaN(quality)) {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(
          [
            {
              error: true,
              msg: `quality should be number type not ${typeof quality} [ quality = 1-100 ]`
            }
          ],
          null,
          3
        )
      );
    } else if (quality == 0 || quality > 100) {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(
          [
            {
              error: true,
              msg: `quality in between 1 & 100 not ${quality} [ quality = 1-100 ]`
            }
          ],
          null,
          3
        )
      );
    } else if (file === "") {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(
          [
            {
              error: true,
              msg: `Found file but it need an value [file = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png']`
            }
          ],
          null,
          3
        )
      );
    } else if (file === undefined) {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(
          [
            {
              error: true,
              msg: `Require file [ file = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png' ]`
            }
          ],
          null,
          3
        )
      );
    } else if (url.parse(file).hostname === null) {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(
          [
            {
              error: true,
              msg: `Invalid file url [ file = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png' ]`
            }
          ],
          null,
          3
        )
      );
    } else {
      quality = parseInt(quality)
      const optimizationLevel = 2
      got
        .get(file, { encoding: null })
        .then(imageResponse => {
          imagemin
            .buffer(imageResponse.body, {
              plugins: [
                imageminGifsicle({ optimizationLevel, interlaced: true }),
                imageminMozjpeg({ quality}),
                imageminJpegtran({ progressive: true }),
                imageminPngquant({ quality: [quality/100,quality/100],speed: 5 })
              ]
            })
            .then(compressedImage => {
              return response.end(compressedImage);
            })
            .catch(error => {
              return response.end(
                JSON.stringify(
                  [
                    {
                      error: true,
                      msg: `Could not compress image from ${file} ${error}`
                    }
                  ],
                  null,
                  3
                )
              );
            });
        })
        .catch(error => {
          return response.end(
            JSON.stringify(
              [
                {
                  error: true,
                  msg: `Could not load image from ${file} ${error}`
                }
              ],
              null,
              3
            )
          );
        });
    }
  } else {
    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify(
        [
          {
            error: true,
            msg:
              "Require image [file='https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'] and quality [ quality=1-100 ]"
          }
        ],
        null,
        3
      )
    );
  }
};

const server = app.createServer(initServer);

server.listen(process.env.PORT || 3000, "0.0.0.0");
