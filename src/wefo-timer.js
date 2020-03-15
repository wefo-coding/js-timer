(function(global){
    
    // Function constructor for Timers
    function Timer(timerContainer){
        if(timerContainer instanceof HTMLElement){
            this.container = timerContainer;
        }
        this.date = 0;
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        
        this.run = false;
        this.endTime = 0;
        this.remaining = 0;
        
        var self = this;
        
        let elements = self.container.getElementsByTagName('input');
        for(i = 0; i < elements.length; i++){
            elements[i].oninput = function(){
                self.updateTime();
            };
        }
        elements = self.container.getElementsByClassName('wefo-timer-start');
        for(i = 0; i < elements.length; i++){
            elements[i].onclick = function(){
                self.setStatus(self.status == 'paused' ? 'continue' : 'run');
            };
        }
        elements = self.container.getElementsByClassName('wefo-timer-pause');
        for(i = 0; i < elements.length; i++){
            elements[i].onclick = function(){
                self.setStatus('pause');
            };
        }
        elements = self.container.getElementsByClassName('wefo-timer-stop');
        for(i = 0; i < elements.length; i++){
            elements[i].onclick = function(){
                self.setStatus('stop');
            };
        }
    }
    
    Timer.prototype.updateTime = function(){
        var self = this;
        
        // Ermittlung des Zeitpunktes, an dem der Timer ablaufen soll.
        var timeElement = self.container.getElementsByClassName('wefo-timer-date')[0];
        self.date = 0;
        if(timeElement && timeElement.value.length > 0){
            self.date = new Date(timeElement.value).getTime(); // returns NaN if Date is not valid.
        }
        
        for(prop in self){
            if(['days', 'hours', 'minutes', 'seconds'].includes(prop)){
                timeElement = self.container.getElementsByClassName('wefo-timer-' + prop)[0];
                if(timeElement && !isNaN(timeElement.value)){
                    self[prop] = timeElement.value || 0;
                }
            }
        }
        self.setEndTime();
        self.setStatus('stop');
    };
    
    Timer.prototype.update = function(){
        var self = this;
        
        if(self.date){
            switch(self.status){
                case 'running':
                    self.setEndTime();
                    self.remaining = self.endTime - new Date().getTime();
                    break;
                default:
                    self.setStatus('running');
                    break;
            }
        }
        else{
            switch(self.status){
                case 'continue':
                    self.setStatus('running');
                    self.setEndTime(self.remaining);
                    break;
                case 'run':
                    self.setStatus('running');
                    self.setEndTime();
                    break;
                case 'running':
                    self.remaining = self.endTime - new Date().getTime();
                    break;
                case 'pause': 
                    self.setStatus('paused');
                    break;
                case 'paused':
                case 'expired':
                case 'stopped':
                    break;
                case 'stop':
                    self.setStatus('stopped');
                    self.setEndTime();
                    self.remaining = self.endTime - new Date().getTime();
                    break;
                default: break;
            }
        }
        
        //Schreibe Zeit in das Feld
        var distance = self.remaining;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        let r = days > 1 ? days + " Days " : "";
        r += days === 1 ? "1 Day " : "";
        r += hours > 0 ? ("00" + hours).slice(-2) + ":" : "";
        r += ("00" + minutes).slice(-2) + ":";
        r += ("00" + seconds).slice(-2);
        self.container.getElementsByClassName('wefo-timer')[0].innerHTML = r;

        // If the count down is finished, write some text
        if (distance < 0 && self.status !== 'expired') {
            self.container.getElementsByClassName('wefo-timer')[0].innerHTML = "00:00";
            self.setStatus('expired');
            var link = self.container.getElementsByClassName('wefo-timer-timeout-link')[0];
            if(link){
                link.click();
            }
        }
    }
    
    Timer.prototype.setEndTime = function(remaining){
        var self = this;
        
        if(!isNaN(remaining)){
            self.endTime = new Date().getTime() + remaining;
        }
        else{
            self.endTime = self.date ? self.date : new Date().getTime();
            self.endTime += self.days * 24 * 60 * 60 * 1000;
            self.endTime += self.hours     * 60 * 60 * 1000;
            self.endTime += self.minutes        * 60 * 1000;
            self.endTime += self.seconds             * 1000;
        }
    }
    
    Timer.prototype.setStatus = function(status){
        var self = this;
        if(self.status !== status){
            self.container.classList.remove(self.status);
            self.status = status;
            self.container.classList.add(self.status);
        }
    }
    
    // Wenn mehrere Timer auf der Seite existieren müssen diese in Containern liegen.
    // Diese Container werden hier ermittelt.
    var timerContainers = document.getElementsByClassName('wefo-timer-container');
    var timers = [];
    
    // Sind keine Container vorhanden wird davon ausgegangen, dass nur ein Timer vorhanden ist.
    // Das Element <body> wird dann als Container angenommen.
    if(!timerContainers || timerContainers.length === 0){
        timerContainers = [];
        timerContainers.push(document.getElementsByTagName('body')[0]);
    }
    
    // Im folgenden findet die Initialisierung der einzelnen Timer statt.
    var timer;
    for(i = 0; i < timerContainers.length; i++){
        timer = new Timer(timerContainers[i]);
        timer.updateTime();
        timers.push(timer);
    }
    
    setInterval(function(){
        for(i = 0; i < timers.length; i++){
            timers[i].update();
        }
    }, 100);
}(window));