.pragma library

// The hosts the network offers, read the way every Linux desktop reads them: avahi's own
// browse, one "= iface proto Name Service Domain" line per resolved _smb._tcp service followed
// by an indented "hostname = [host.local]" line, then "--" (sample input in tests/js/dnssd.js,
// captured from a live LAN). The service's own Name labels the row and the hostname beneath it
// is the row's target, because a service name and its host are free to differ.

var SERVICE_LINE = /^=\s*\S+\s+\S+\s+(.+?)\s+Microsoft Windows Network\s+local\s*$/
var HOST_LINE = /^\s*hostname\s*=\s*\[([^\]]+)\]\s*$/

function parse(text) {
    var out = []
    var seen = ({})
    var pending = ""
    var lines = String(text || "").split("\n")
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i]
        var host = line.match(HOST_LINE)
        if (host && pending) {
            // Two services on one host keep one row: the first answer names the target.
            if (!seen[host[1]]) {
                seen[host[1]] = true
                out.push({ label: pending, host: host[1] })
            }
            pending = ""
            continue
        }
        var service = line.match(SERVICE_LINE)
        if (service) pending = service[1]
        else if (line.indexOf("--") === 0) pending = ""
    }
    out.sort(function (a, b) { return a.label.localeCompare(b.label) })
    return out
}

// A host row activates on the bare server root, which an open answers by listing its shares.
function hostUri(host) { return "smb://" + String(host || "") + "/" }
