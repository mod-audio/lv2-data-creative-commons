function(event) {
    // This is a workaround to remove "Bpm" string from value.
    var bpm;
    if (event.type == "start") {
        bpm = event.ports.filter(function(port) { return port.symbol == "Bpm" })[0].value;
    } else if (event.symbol == "Bpm") {
        bpm = event.value;
    } else {
        return;
    }
    bpm = bpm.toFixed(0);
    event.icon.find('[mod-role=input-control-value][mod-port-symbol=Bpm]').text(bpm.toString());
}
