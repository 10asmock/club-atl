$(document).ready(function(){

    var width =  $( document ).width();

    $(window).resize(function(){
        var width = $( document ).width();
        console.log(width);
    });

    // if(width < 991){
    //     $("#list-coworking").toggleClass('hidden-sm hidden-xs');
    // }

    $('#btn-mobile-menu').click(function(){
        $("#list-nightclub").toggleClass('hidden-sm hidden-xs');
    });

});
