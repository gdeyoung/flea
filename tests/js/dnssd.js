.import "../../ui/js/Dnssd.js" as Dnssd

// Downstream (driveway-fm): the hosts layer of the network browser, as pure functions over
// avahi-browse's own answer. The sample body below is a real capture: four servers, one of them
// advertising twice, which is the shape the dedupe rule exists for.

var LIVE = [
    "+   wlo1 IPv4 AIBox                                        Microsoft Windows Network local",
    "=   wlo1 IPv4 AIBox                                        Microsoft Windows Network local",
    "   hostname = [AIBox.local]",
    "   address = [192.168.1.41]",
    "--",
    "=   wlo1 IPv4 WaterTower                                   Microsoft Windows Network local",
    "   hostname = [WaterTower.local]",
    "   address = [192.168.1.249]",
    "--",
    "=   wlo1 IPv4 Homeserver                                   Microsoft Windows Network local",
    "   hostname = [Homeserver.local]",
    "   address = [192.168.1.61]",
    "--",
    "=   wlo1 IPv4 Node                                         Microsoft Windows Network local",
    "   hostname = [Node.local]",
    "--",
    "=   wlo1 IPv4 Homeserver                                   Microsoft Windows Network local",
    "   hostname = [Homeserver.local]",
    "--"
].join("\n")

function parse(check) {
    var hosts = Dnssd.parse(LIVE)
    check("one row per hostname, duplicates dropped", hosts.length, 4)
    check("rows sort by their own labels", [hosts[0].label, hosts[1].label, hosts[2].label, hosts[3].label].join("|"),
        "AIBox|Homeserver|Node|WaterTower")
    check("the row carries its service's name and its host's address", hosts[3].host, "WaterTower.local")
    check("a resolved service with no hostname line names no row", Dnssd.parse("=   wlo1 IPv4 Ghost   Microsoft Windows Network local\n--").length, 0)
    check("an empty body reads as no hosts", Dnssd.parse("").length, 0)
    check("no body at all reads as no hosts", Dnssd.parse(null).length, 0)
    check("garbage reads as no hosts", Dnssd.parse("hostname = [x.local]\nrandom text").length, 0)
}

function targets(check) {
    check("a host row targets the bare server root", Dnssd.hostUri("WaterTower.local"), "smb://WaterTower.local/")
    check("no host targets nothing", Dnssd.hostUri(""), "smb:///")
}

function dnssd(check) {
    parse(check)
    targets(check)
}

function run(check) {
    parse(check)
    targets(check)
}
