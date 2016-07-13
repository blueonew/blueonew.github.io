var CarouselCenter = (function() {
	function init(carouselList) {

		for (var i = 0; i < carouselList.length; i++) {
			if (carouselList[i].classList.contains("init")) {
				return;
			}
			var interval = carouselList[i].getAttribute('data-Interval');
                        if(!interval){interval = 6000;}
				
			new Carousel(carouselList[i], interval);
			carouselList[i].classList.add('init');
		}
	}

	function Carousel(carouselElem, Interval) {
		this.Interval = Interval;
		this.carouselElem = carouselElem;
		var ct = this.ct = carouselElem.getElementsByClassName('img-ct');
		var firstCt = this.firstCt = ct[0];
		this.imgWidth = firstCt.firstElementChild.style.width.split("px")[0];
		this.imgSize = firstCt.children.length;
		this.clock;
		firstCt.style.width = this.imgWidth * this.imgSize + 'px';		
		this.autoPlay();
	}

	Carousel.prototype = {
		showNext : function() {
			var carouselElem = this.carouselElem;
			var firstCt = this.firstCt;
			try {
				var visibilityValue = document.getElementById(carouselElem.getAttribute('data-focus_id')).style.visibility;
				if (visibilityValue == "visible") {					
					return;
				}
			} catch (e) {
				console.log("style.visibility wrong");
			}
			firstCt.style.left = this.imgWidth + 'px';
			firstCt.appendChild(firstCt.firstElementChild);			
			firstCt.style.left = '0px';
		},
		autoPlay : function() {
			var _this = this;
			_this.clock = setInterval(function() {
				_this.showNext(_this.carouselElem);
			}, _this.Interval);
		}
	};
	return {
		init : init,
	}

})();
function carouselInit() {
	CarouselCenter.init(document.getElementsByClassName('carousel'));
}
function enterCarousel(obj) {	
	obj.firstElementChild.firstElementChild.getAttribute('onclick');
	obj.firstElementChild.firstElementChild.onclick();
}
function excuteOnClick(obj) {

	console.log("this.id " + obj.getAttribute('id'));
}