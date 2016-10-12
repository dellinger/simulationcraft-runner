var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var simcCommand = '"C:\\Simulationcraft(x64)\\703-03\\simc.exe"';

// Read profiles subdirectory
fs.readdir('profiles', function(err, files){
    if(err){
        console.error(err);
    }
    for(var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileExt = path.extname(file);
        if(fileExt === '.simc'){
            console.log("Starting log for " + file);
            var jsonOutput = `results/temp_${file}.json`;
            var simcCommandWithArgs = `${simcCommand} ${file} json=${jsonOutput}`;
            console.log(simcCommandWithArgs);
            exec(simcCommandWithArgs, {maxBuffer : 500 * 1024}, function(error, stdout, stderr){
                 // Ensure file was created properly
                if(error){
                    console.log(error);
                }
                //console.log(`Going to try to read ${jsonOutput}`);
                var rawOutput = fs.readFileSync(jsonOutput,'utf8');
                var rawSimulation = JSON.parse(rawOutput);
                if(rawSimulation){
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
                    console.log(file);
                    console.log(`${file} ::: Iterations: ${iterations} | ${dps.name}:${Math.round(dps.mean)} Scale Factors:: Int ${scaleFactors.Int} : Haste: ${scaleFactors.Haste} : Crit: ${scaleFactors.Crit} : Vers: ${scaleFactors.Vers}) : Mastery: ${scaleFactors.Mastery}`);
                }

            });
        }
       // console.log(path.extname(files[file]));
    }
 //   console.log(files);

});
