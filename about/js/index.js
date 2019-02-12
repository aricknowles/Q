// JQUERY
$(function() {
	$(window).bind('load', function() {
		$('.overlay, body').addClass('loaded');
		setTimeout(function() {
			$('.overlay').css({'display':'none'})
		}, 1000);
	});
	// Will load page after 1min 	
	setTimeout(function() {
		$('.overlay').addClass('loaded');
	}, 60000);
	
	setInterval(function() {
	  var rand = Math.floor(Math.random() * 4);
	  document.getElementById("name").innerHTML = names[rand];
	}, 3500);
	
});