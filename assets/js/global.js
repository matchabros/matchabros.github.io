$(document).ready(function () {
	var aboutContact = $('.about-contact');
	var btn = $('#about-nav');
    //Hide the About me/Contact section
	aboutContact.hide();

    $(function () {
    	btn.on('click', function () {
	        aboutContact.fadeIn(300);
            $('.about-me p').addClass('fadeIn-animation');//Add the animaition class
            $('.about-me h1:first').addClass('underline-animation');//Add the animaition class
            $('.about-me a').addClass('social-animation');//Add the animation class
        });
    });
    $(function () {
    	aboutContact.on('click', function (){
    		aboutContact.fadeOut(300);
    	});
    });
});

