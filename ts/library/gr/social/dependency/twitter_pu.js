var pu_window;

export function pu(pu_url) {
    var pu_width = window.innerWidth - 200;
    var pu_height = window.innerHeight - 50;
    var b = "toolbar=0,statusbar=1,resizable=1,scrollbars=0,menubar=0,location=1,directories=0";
    if (navigator.userAgent.indexOf("Chrome") != -1) b = "scrollbar=yes";
    var a = window.open("about:blank", "", b + ",height=" + pu_height + ",width=" + pu_width);

    if (navigator.userAgent.indexOf("rv:2.") != -1) {
        a.puPop = function(c) {
            if (navigator.userAgent.indexOf("rv:2.") != -1) this.window.open("about:blank").close();
            this.document.location.href = c;
        };
        a.puPop(pu_url);
    } else
        a.document.location.href = pu_url;
    setTimeout(window.focus, 200);
    window.focus();
    if (a) {
        a.moveTo(window.screenX + 2, window.screenY + 2);
        a.blur();
        self.focus();
    } else {
        done_pu = null;
        ifSP2 = false;
        if (typeof(pu_window) == "undefined") pu_window = false;
        if (window.SymRealWinOpen) open = SymRealWinOpen;
        if (window.NS_ActualOpen) open = NS_ActualOpen;
        ifSP2 = (navigator.userAgent.indexOf("SV1") != -1);
        if (!ifSP2)
            do_pu();
        else {
            if (window.Event) document.captureEvents(Event.CLICK);
            document.onclick = do_clicked_pu;
        }
        self.focus();
        do_clicked_pu();
    }
    return this;
}

export function do_pu() {
    if (!pu_window) {
        done_pu = open(pu_url, "", "toolbar=1,location=1,directories=0,status=1,menubar=1,scrollbars=1,resizable=1");
        if (done_pu) {
            pu_window = true;
            self.focus();
        }
    }
}

export function do_clicked_pu() {
    if (!pu_window) {
        if (!ifSP2) {
            done_pu = open(pu_url, "", "toolbar=1,location=1,directories=0,status=1,menubar=1,scrollbars=1,resizable=1");
            self.focus();
            if (done_pu) pu_window = true;
        }
    }
    if (!pu_window) {
        if (window.Event) document.captureEvents(Event.CLICK);
        document.onclick = do_pu;
        self.focus();
    }
}