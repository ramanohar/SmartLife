var gulp = require("gulp");
var gutil = require("gulp-util");
var foreach = require("gulp-foreach");
var rimrafDir = require("rimraf");
var rimraf = require("gulp-rimraf");
var runSequence = require("run-sequence");
var fs = require("fs");
var path = require("path");
var xmlpoke = require("xmlpoke");
var config = require("./gulpfile.js").config;
var unicorn = require("./scripts/unicorn.js");
var websiteRootBackup = config.websiteRoot;
var zip = require("gulp-zip");
var gulp = require('gulp');
var replace = require('gulp-replace');
var args = require('yargs').argv;
var fileName = process.argv[4];
var ID = process.argv[6];
var Title = process.argv[8];
var Version = process.argv[10];
var Author = process.argv[12];
var Notes = process.argv[14];


gulp.task("CI-Publish", function (callback) {
    config.websiteRoot = path.resolve("./temp");
    config.buildConfiguration = "Release";
    fs.mkdirSync(config.websiteRoot);
    runSequence(
      "Build-Solution",
      "Publish-Foundation-Projects",
      "Publish-Feature-Projects",
      "Publish-Project-Projects", callback);
});

gulp.task("CI-Prepare-Package-Files", function (callback) {
    var excludeList = [
      config.websiteRoot + "\\bin\\{Sitecore,Lucene,Newtonsoft,System,Microsoft.Web.Infrastructure}*dll",
      config.websiteRoot + "\\compilerconfig.json.defaults",
      config.websiteRoot + "\\packages.config",
      config.websiteRoot + "\\App_Config\\Include\\{Feature,Foundation,Project}\\*Serialization.config",
      config.websiteRoot + "\\App_Config\\Include\\{Feature,Foundation,Project}\\z.*DevSettings.config",
      "!" + config.websiteRoot + "\\bin\\Sitecore.Support*dll",
      "!" + config.websiteRoot + "\\bin\\Sitecore.{Feature,Foundation,Habitat,Demo,Common}*dll"
    ];
    console.log(excludeList);

    return gulp.src(excludeList, { read: false }).pipe(rimraf({ force: true }));
});

gulp.task("CI-Enumerate-Files", function () {
    var packageFiles = [];
    config.websiteRoot = websiteRootBackup;

    return gulp.src(path.resolve("./temp") + "/**/*.*", { base: "temp", read: false })
      .pipe(foreach(function (stream, file) {
          var item = "/" + file.relative.replace(/\\/g, "/");
          console.log("Added to the package:" + item);
          packageFiles.push(item);
          return stream;
      })).pipe(gutil.buffer(function () {
          xmlpoke("./package.xml", function (xml) {
              for (var idx in packageFiles) {
                  xml.add("project/Sources/xfiles/Entries/x-item", packageFiles[idx]);
              }
          });
      }));
});

gulp.task("CI-Enumerate-Items", function () {
    var itemPaths = [];
    var allowedPatterns = [
      "./src/**/serialization/**/*.yml",
      "!./src/**/serialization/*.Roles/**/*.yml",
      "!./src/**/serialization/*.Users/**/*.yml"
    ];
    return gulp.src(allowedPatterns)
        .pipe(foreach(function (stream, file) {
        console.log(file);
            var itemPath = unicorn.getFullItemPath(file);
            itemPaths.push(itemPath);
            return stream;
        })).pipe(gutil.buffer(function () {
            xmlpoke("./package.xml", function (xml) {
                for (var idx in itemPaths) {
                    xml.add("project/Sources/xitems/Entries/x-item", itemPaths[idx]);
                }
            });
        }));
});

gulp.task("CI-Enumerate-Users", function () {
    var users = [];

    return gulp.src("./src/**/serialization/*.Users/**/*.yml")
        .pipe(foreach(function (stream, file) {
          console.log(file);
            var fileContent = file.contents.toString();
            var userName = unicorn.getUserPath(file);
            users.push(userName);
            return stream;
        })).pipe(gutil.buffer(function () {
            xmlpoke("./package.xml", function (xml) {
                for (var idx in users) {
                    xml.add("project/Sources/accounts/Entries/x-item", users[idx]);
                }
            });
        }));
});

gulp.task("CI-Enumerate-Roles", function () {
    var roles = [];

    return gulp.src("./src/**/serialization/*.Roles/**/*.yml")
        .pipe(foreach(function (stream, file) {
          console.log(file);
            var fileContent = file.contents.toString();
            var roleName = unicorn.getRolePath(file);            
            roles.push(roleName);
            return stream;
        })).pipe(gutil.buffer(function () {
            xmlpoke("./package.xml", function (xml) {
                for (var idx in roles) {
                    xml.add("project/Sources/accounts/Entries/x-item", roles[idx]);
                }
            });
        }));
});
gulp.task("CI-Copy-Unicorn-Items", function () {
    var itemPaths = [];
    console.log(path.resolve("./src/**/serialization/**/*.yml"));
    return gulp.src("./src/**/serialization/**/*.yml").pipe(gulp.dest(path.resolve('./temp/unicorn')));
});

gulp.task("CI-Copy-Unicorn-Users", function () {
    var itemPaths = [];
    console.log(path.resolve("./src/**/users/**/*.yml"));
    return gulp.src("./src/**/users/**/*.yml").pipe(gulp.dest(path.resolve('./temp/unicorn')));
});

gulp.task("CI-Copy-Unicorn-Roles", function () {
    var itemPaths = [];
    console.log(path.resolve("./src/**/roles/**/*.*"));
    return gulp.src("./src/**/roles/**/*.*").pipe(gulp.dest(path.resolve('./temp/unicorn')));
});
gulp.task("CI-Clean", function (callback) {
    rimrafDir.sync(path.resolve("./temp"));
    callback();
});
gulp.task("Nuspec-File-Replace", function () {
    console.log(ID);
    //console.log(fileName);
    return gulp.src("./" + fileName)
		.pipe(replace("pck-id", ID))
		.pipe(replace("pck-title", Title))
		.pipe(replace("pck-version", Version))
		.pipe(replace("pck-authors", Author))
		.pipe(replace("pck-description", Notes))
		.pipe(gulp.dest('./temp/'));
});
gulp.task("CI-Do-magic", function (callback) {
    runSequence(
        "CI-Clean",
        "CI-Publish",
        "CI-Copy-Unicorn-Items", //To be uncommented when moved to build server 
		"CI-Copy-Unicorn-Users", //To be uncommented when moved to build server 
		"CI-Copy-Unicorn-Roles", //To be uncommented when moved to build server 
        //"CI-Clean",
        callback);
});
