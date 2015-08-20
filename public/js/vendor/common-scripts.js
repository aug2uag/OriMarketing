/*---LEFT BAR ACCORDION----*/
$(function() {
    $('#nav-accordion').dcAccordion({
        eventType: 'click',
        autoClose: true,
        saveState: true,
        disableLink: true,
        speed: 'slow',
        showCount: false,
        autoExpand: true,
//        cookie: 'dcjq-accordion-1',
        classExpand: 'dcjq-current-parent'
    });
});

var Script = function () {


//    sidebar dropdown menu auto scrolling

    function resizeMarketingActiveSidebar() {
        $('#selections').addClass('container col-sm-offset-3').removeClass('container col-sm-offset-1');
        $('#postSelections').addClass('container col-sm-offset-3').removeClass('container col-sm-offset-1');
    }

    function resizeMarketingInactiveSidebar() {
        $('#selections').addClass('container col-sm-offset-1').removeClass('container col-sm-offset-3');
        $('#postSelections').addClass('container col-sm-offset-1').removeClass('container col-sm-offset-3');
    }

    function resizeNewsfeedActiveSidebar() {
        $('#selections').addClass('container col-sm-offset-3').removeClass('container col-sm-offset-1');
        $('#approved_content').addClass('container col-sm-offset-3').removeClass('container col-sm-offset-1');
        $('#pending_approval').addClass('container col-sm-offset-3').removeClass('container col-sm-offset-1');
    }

    function resizeNewsfeedInactiveSidebar() {
        $('#selections').addClass('container col-sm-offset-1').removeClass('container col-sm-offset-3');
        $('#approved_content').addClass('container col-sm-offset-1').removeClass('container col-sm-offset-3');
        $('#pending_approval').addClass('container col-sm-offset-1').removeClass('container col-sm-offset-3');
    }


//    sidebar toggle

    $(function() {
        function responsiveView() {
            var wSize = $(window).width();
            if (wSize <= 768) {
                $('#container').addClass('sidebar-close');
                $('#sidebar > ul').hide();
            }

            if (wSize > 768) {
                $('#container').removeClass('sidebar-close');
                $('#sidebar > ul').show();
            }
        }
        $(window).on('load', responsiveView);
        $(window).on('resize', responsiveView);
    });

    $('.fa-bars').click(function () {
        if ($('#sidebar > ul').is(":visible") === true) {
            $('#main-content').css({
                'margin-left': '0px'
            });
            $('#sidebar').css({
                'margin-left': '-210px'
            });
            $('#sidebar > ul').hide();
            $("#container").addClass("sidebar-closed");
            if ($('#marketing_campaign')) resizeMarketingInactiveSidebar();
            if ($('#expertise_campaign')) resizeNewsfeedInactiveSidebar();
        } else {
            $('#main-content').css({
                'margin-left': '210px'
            });
            $('#sidebar > ul').show();
            $('#sidebar').css({
                'margin-left': '0'
            });
            $("#container").removeClass("sidebar-closed");
            if ($('#marketing_campaign')) resizeMarketingActiveSidebar();
            if ($('#expertise_campaign')) resizeNewsfeedActiveSidebar();
        }
    });

// widget tools

    jQuery('.panel .tools .fa-chevron-down').click(function () {
        var el = jQuery(this).parents(".panel").children(".panel-body");
        if (jQuery(this).hasClass("fa-chevron-down")) {
            jQuery(this).removeClass("fa-chevron-down").addClass("fa-chevron-up");
            el.slideUp(200);
        } else {
            jQuery(this).removeClass("fa-chevron-up").addClass("fa-chevron-down");
            el.slideDown(200);
        }
    });

    jQuery('.panel .tools .fa-times').click(function () {
        jQuery(this).parents(".panel").parent().remove();
    });


//    tool tips

    $('.tooltips').tooltip();

//    popovers

    $('.popovers').popover();



}();