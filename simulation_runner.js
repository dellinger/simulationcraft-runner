var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').execSync;
var del = require('del');
var watch = require('watch');
var EventEmitter = require('events');
var eventEmitter = new EventEmitter();
var spawn = require('child_process').spawn;

var simcCommand = '"C:\\Simulationcraft(x64)\\703-03\\simc.exe"';
var resultsDir = __dirname + '/results';

eventEmitter.on('simulation:ended', function(file) {
   console.log("Simulation Ended event hit: " + file);
        //console.log(`Going to try to read ${jsonOutput}`);
        var rawOutput = fs.readFileSync(file,'utf8');
        var rawSimulation = JSON.parse(rawOutput);
        if(rawSimulation) {
            var buildDate = rawSimulation.build_date;
            var buildTime = rawSimulation.build_time;
            var simVersion = rawSimulation.version;
            var fightStyle = rawSimulation.sim.fight_style;
            var iterations = rawSimulation.sim.iterations;
            var character = rawSimulation.sim.players[0];
            var specialization = character.specialization;
            var scaleFactors = character.scale_factors;
            var collectedData = character.collected_data;
            var dps = collectedData.dps;
            console.log(`${file} ::: Iterations: ${iterations} | ${dps.name}:${Math.round(dps.mean)} Scale Factors:: Int ${scaleFactors.Int} : Haste: ${scaleFactors.Haste} : Crit: ${scaleFactors.Crit} : Vers: ${scaleFactors.Vers}) : Mastery: ${scaleFactors.Mastery}`);
        }
});

// Ensure 'results' directory is clean
fs.emptyDir(resultsDir, function(err){
    if(err){
        console.error(err);
    }
    fs.readdir('profiles', function(err, files) {
        if (err) {
            console.error(err);
        }
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileExt = path.extname(file);
            if (fileExt === '.simc') {
                var jsonOutput = `${resultsDir}/temp_${file}.json`;
                var simcCommandWithArgs = `${simcCommand} ${file} json=${jsonOutput}`;
                // synchronous for now
                var stdOut = exec(simcCommandWithArgs);
                eventEmitter.emit('simulation:ended', jsonOutput);
            }
        }
    });
});

