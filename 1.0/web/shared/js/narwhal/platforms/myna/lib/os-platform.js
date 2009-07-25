
var io = require('io');

exports.exit = function (status) {
    Packages.java.lang.System.exit(status << 0);
};

exports.sleep = function (seconds) {
    Packages.java.lang.Thread.sleep((seconds * 1000) >>> 0);
};

exports.fork = function () {
};

exports.exec = function () {
};

exports.dup = function () {
};

exports.dup2 = function () {
};

exports.setsid = function () {
};

exports.getpid = function () {
};

var javaRuntime = function () {
    return Packages.java.lang.Runtime.getRuntime();
};

var javaPopen = function (command) {
    return javaRuntime().exec(command);
};

exports.popen = function (command, options) {
    // todo options: "b", {charset, shell}
    if (typeof command == "string")
        command = ["sh", "-c", command];
    var process = javaPopen(command);

    var stdin = new io.TextOutputStream(new io.IO(null, process.getOutputStream()));
    var stdout = new io.TextInputStream(new io.IO(process.getInputStream()));
    var stderr = new io.TextInputStream(new io.IO(process.getErrorStream()));

    return {
        wait: function () {
            return process.waitFor();
        },
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
        communicate: function (stdin) {
            if (stdin === undefined)
                stdin = "";

            var out;
            var err;

            var outThread = new JavaAdapter(Packages.java.lang.Thread, {
                "run": function () {
                    out = stdout.read();
                }
            });

            var errThread = new JavaAdapter(Packages.java.lang.Thread, {
                "run": function () {
                    err = stderr.read();
                }
            });

            errThread.setDaemon(true);
            errThread.start();
            outThread.setDaemon(true);
            outThread.start();

            outThread.join();
            errThread.join();

            var code = process.waitFor();

            return {
                code: code,
                stdout: out,
                stderr: err
            };
        }
    }
};

exports.system = function (command) {
    var process = exports.popen(command);
    process.stdout.close();
    process.stdin.close();
    // TODO should communicate on all streams
    // without managing all streams simultaneously,
    // if stderr's buffer fills while reading
    // from stdout, the process will deadlock.
    return process.wait();
};

