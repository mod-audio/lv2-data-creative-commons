function(event) {
    //status bitmasks
    var SINGLE_PRESS_ON = 1;
    var DOUBLE_PRESS_ON = 2;
    var LONG_PRESS_ON   = 4;

    var mask;
    var portName = "ButtonStatusMask";

    if (event.type == 'change' && event.uri === "http://moddevices.com/plugins/mod-devel/mod-button-to-cv#CVStateMask") {
        mask = event.value;
    } else {
        return;
    }

    var icon_led_1 = event.icon.find('.js-sp-led');
    if (mask & SINGLE_PRESS_ON) {
        icon_led_1.addClass('on');
    } else {
        icon_led_1.removeClass('on');
    }

    var icon_led_2 = event.icon.find('.js-lp-led');
    if (mask & LONG_PRESS_ON) {
        icon_led_2.addClass('on');
    } else {
        icon_led_2.removeClass('on');
    }

    var icon_led_3 = event.icon.find('.js-dp-led');
    if (mask & DOUBLE_PRESS_ON) {
        icon_led_3.addClass('on');
    } else {
        icon_led_3.removeClass('on');
    }
}