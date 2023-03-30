const fs = require("fs");
const path = require("path");
const moment = require("moment");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const now = moment().format();

const templatesPath = path.join(__dirname, ".frontmatter", "templates");
const templateFilenames = fs.readdirSync(templatesPath);

let templateChoices = "";
for (let i = 0; i < templateFilenames.length; i++) {
  const filename = templateFilenames[i];
  const name = path.basename(filename, ".md");
  if (!filename.includes("licenses")) {
    templateChoices += `${i + 1}. ${name}\n`;
  }
}

rl.question("Enter the title of the post: ", (title) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9- ]/g, "")
    .replace(/\s+/g, "-")
    .trim();

  rl.question(`Choose a template:\n${templateChoices}`, (templateChoice) => {
    let template = "";

    if (templateChoice >= 1 && templateChoice <= templateFilenames.length) {
      const filename = templateFilenames[templateChoice - 1];
      template = fs.readFileSync(path.join(templatesPath, filename), {
        encoding: "utf-8",
      });
    } else {
      console.log("Invalid template choice, using default template.");
      template = fs.readFileSync(
        path.join(__dirname, ".frontmatter", "templates", "default.md"),
        { encoding: "utf-8" }
      );
    }

    const licensesPath = path.join(templatesPath, "licenses", "licenses.json");
    const licenses = JSON.parse(fs.readFileSync(licensesPath, "utf8"));

    let licenseChoices = "";
    licenses.license.choices.forEach((license, index) => {
      licenseChoices += `${index + 1}. ${license.name}: ${license.description}\n`;
    });

    rl.question(`Choose a license:\n${licenseChoices}`, (licenseChoice) => {
      const selectedLicense = licenses.license.choices[licenseChoice - 1];

      const frontmatter = template
        .replace(/\${title}/g, title)
        .replace(/\${now}/g, now)
        .replace(/\${license}/g, selectedLicense.name)
        .replace(/\${slug}/g, slug);

      const postFilename = `${slug}.md`;
      const postsFolderPath = path.join(__dirname, "content", "Posts");
      const outputPath = path.join(postsFolderPath, postFilename);

      // Create the content/Posts folder if it doesn't exist
      if (!fs.existsSync(postsFolderPath)) {
        fs.mkdirSync(postsFolderPath, { recursive: true });
      }

      fs.writeFile(outputPath, frontmatter, (err) => {
        if (err) {
          console.error("Error creating the post:", err);
          process.exit(1);
        }

        console.log(`Post created successfully: ${postFilename}`);
        rl.close();
      });
    });
  });
});
