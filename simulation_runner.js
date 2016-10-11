var fs = require('fs');
var path = require('path');
var exec = require('child_process').execFileSync;

var simcCommand = "C:\\Simulationcraft(x64)\\703-03\\simc.exe";

// Read profiles subdirectory
fs.readdir('profiles', function(err, files){
    if(err){
        console.error(err);
    }
    for(var i in files) {
        var file = files[i];
        var fileExt = path.extname(file);
        if(fileExt === '.simc'){
            console.log("Starting log for " + file);
            exec(simcCommand, [file, `json=results/temp_${file}.json`], function(error, stdout, stderr){
                 // Ensure file was created properly
                if(error){
                    console.log(error);
                }
               fs.readFileSync('results/temp.json', function(error, contents){
                   // Turn output into JSON object
                   if(error){
                       console.log(error);
                   }
                   var rawSimulation = JSON.parse(contents);
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

                   console.log(`Iterations: ${iterations} | ${dps.name}:${Math.round(dps.mean)} Scale Factors:: Int ${scaleFactors.Int} : Haste: ${scaleFactors.Haste} : Crit: ${scaleFactors.Crit} : Vers: ${scaleFactors.Vers}) : Mastery: ${scaleFactors.Mastery}`);
               });
            });
        }
       // console.log(path.extname(files[file]));
    }
 //   console.log(files);

});
