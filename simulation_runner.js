var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').execSync;
var del = require('del');
var watch = require('watch');
var EventEmitter = require('events');
var eventEmitter = new EventEmitter();
var spawn = require('child_process').spawn;
var Table = require('easy-table');
var simcCommand = '"C:\\Simulationcraft(x64)\\703-03\\simc.exe"';
var resultsDir = __dirname + '/results';
// instantiate
var table = new Table();

var SimulationRunner = function() {
    this.processCounter = 0;
    this.simulationRegistry = {};
    this.numberOfSimulations = 0;
    eventEmitter.on('simulation:ended', (file) =>{
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
            this.simulationRegistry[file] = {
                'dps' : dps,
                'buildDate' : buildDate,
                'simVersion' : simVersion,
                'iterations' : iterations,
                'character':character,
                'specialization' : specialization,
                'scaleFactors' : scaleFactors
            };
            this.decrement();
            //     console.log(`${file} ::: Iterations: ${iterations} | ${dps.name}:${Math.round(dps.mean)} Scale Factors:: Int ${scaleFactors.Int} : Haste: ${scaleFactors.Haste} : Crit: ${scaleFactors.Crit} : Vers: ${scaleFactors.Vers}) : Mastery: ${scaleFactors.Mastery}`);
        }

    });

    eventEmitter.on('print', () => {
        if(this.processCounter === 0){
            // Process table
            for(var key in this.simulationRegistry) {
                var simResult = this.simulationRegistry[key];
                table.cell("SimVersion", simResult.simVersion);
                table.cell("Character", simResult.character.name);
                table.cell(simResult.dps.name + " (mean)", simResult.dps.mean);
                table.cell("Specialization", simResult.specialization);
                table.cell("Iterations", simResult.iterations);

                table.newRow();
            }
            console.log(table.toString());
        }
    });


// Ensure 'results' directory is clean
    fs.emptyDir(resultsDir, (err) =>{
        if(err){
            console.error(err);
        }
        fs.readdir('profiles', (err, files)=> {
            if (err) {
                console.error(err);
            }
            for (var i = 0; i < files.length; i++) {
                this.numberOfSimulations = files.length;
                var file = files[i];
                    this.increment();
                    var jsonOutput = `${resultsDir}/temp_${file}.json`;
                    var simcCommandWithArgs = `${simcCommand} ${file} json=${jsonOutput}`;
                    // synchronous for now
                    var stdOut = exec(simcCommandWithArgs);
                    eventEmitter.emit('simulation:ended', jsonOutput, this);
            }
            eventEmitter.emit('print');
        });
    });
};
SimulationRunner.prototype.increment = function(){
    this.processCounter++;
};
SimulationRunner.prototype.decrement = function(){
    this.processCounter--;
};

var test = new SimulationRunner();




