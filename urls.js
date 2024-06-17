const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
const { argv } = require("process");
const isURL = require("is-url");

const errorMessage = "cannot access file";

async function readUrlFile(filename) {
  return new Promise((resolve, reject) => {
    const urlList = [];
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(errorMessage);
        return reject(new Error(errorMessage));
      }
      const fileStream = fs.createReadStream(filename);
      fileStream.on("error", (error) => {
        console.error(errorMessage);
        return reject(new Error(errorMessage));
      });
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      rl.on("line", (line) => {
        urlList.push(line);
      });

      rl.on("close", () => {
        console.log("Done reading file");
        resolve(urlList);
      });
    });
  });
}

async function writeToFiles(arr) {
  let http = "http://";
  let https = "https://";

  for (const url of arr) {
    let fileName = "";
    if (isURL(url)) {
      if (url.startsWith(https)) {
        fileName = url.slice(https.length);
      } else {
        fileName = url.slice(http.length);
      }

      fileName = fileName.replace(/[\/:*?"<>|]/g, "_");
      //replaces illegal characters to successfully create a new file.

      try {
        const resp = await axios.get(url);
        const data = resp.data;
        await fs.writeFile(fileName, data, "utf-8");
      } catch (err) {
        console.error("failed to write data");
      }
    }
  }
}

// Example usage:
(async () => {
  try {
    const urls = await readUrlFile(argv[2]);
    await writeToFiles(urls);
    // console.log(urls[0]);
  } catch (error) {
    console.error(error.message);
  }
})();
