function (event) {
    /* constants */
    var dca_width = 98;
    var dcf_width = 98;
    var lfo_width = 153;
    /* common */
    var svg_height = 78;

    function draw_adsr(elem, a, d, s, r) {
        var svg = elem.svg('get');
        svg.clear();

        var quarter_width = elem.width() / 4;
        var attack_w = a * quarter_width;
        var decay_w = d * quarter_width;
        var sustain_h = (1.0 - s) * svg_height;
        var release_w = r * quarter_width;

        var path = [
            // start
            [0, svg_height],
            // attack
            [attack_w, 0],
            // decay
            [attack_w + decay_w, sustain_h],
            // sustain
            [attack_w + decay_w + quarter_width, sustain_h],
            // release
            [attack_w + decay_w + quarter_width + release_w, svg_height],
        ];

        // setup gradient
        var defs = svg.defs();
        svg.linearGradient(defs, 'fadeBg', [[0, '#2e5033'], [1, '#1a2d1d']]);

        // draw polygon
        var g = svg.group({stroke: '#009515', strokeWidth: 2.0, fill: 'url(#fadeBg)'});
        svg.polygon(g, path, {});
    }

    function setup_svg(elem, width) {
        // enable svg element
        elem.svg();
        // setup svg size
        var svg = elem.svg('get');
        svg.configure({width: '' + width + 'px'}, false);
        svg.configure({height: '' + svg_height + 'px'}, false);
    }

    if (event.type == 'start')
    {
        var symbol;

        // cache relevant values locally
        var values = event.data.values = {};
        for (var i in event.ports)
        {
            symbol = event.ports[i].symbol;

            if (symbol.endsWith('_ATTACK') ||
                symbol.endsWith('_DECAY') ||
                symbol.endsWith('_SUSTAIN') ||
                symbol.endsWith('_RELEASE'))
            {
                values[symbol] = event.ports[i].value;
            }
        }

        // get elements
        var dca = event.icon.find('[mod-role="samplv1-dca-svg"]');
        var dcf = event.icon.find('[mod-role="samplv1-dcf-svg"]');
        var lfo = event.icon.find('[mod-role="samplv1-lfo-svg"]');

        // setup svgs
        setup_svg(dca, dca_width);
        setup_svg(dcf, dcf_width);
        setup_svg(lfo, lfo_width);

        // initial drawing
        draw_adsr(dca,
                  values['DCA1_ATTACK'],
                  values['DCA1_DECAY'],
                  values['DCA1_SUSTAIN'],
                  values['DCA1_RELEASE']);
        draw_adsr(dcf,
                  values['DCF1_ATTACK'],
                  values['DCF1_DECAY'],
                  values['DCF1_SUSTAIN'],
                  values['DCF1_RELEASE']);
        draw_adsr(lfo,
                  values['LFO1_ATTACK'],
                  values['LFO1_DECAY'],
                  values['LFO1_SUSTAIN'],
                  values['LFO1_RELEASE']);
    }
    else if (event.type == 'change')
    {
        if (event.symbol === undefined)
            return;

        // update cached values
        if (event.symbol.endsWith('_ATTACK') ||
            event.symbol.endsWith('_DECAY') ||
            event.symbol.endsWith('_SUSTAIN') ||
            event.symbol.endsWith('_RELEASE'))
        {
            var values = event.data.values;
            values[event.symbol] = event.value;

            // draw new polygons
            /**/ if (event.symbol.startsWith('DCA1_'))
            {
                draw_adsr(event.icon.find('[mod-role="samplv1-dca-svg"]'),
                          values['DCA1_ATTACK'],
                          values['DCA1_DECAY'],
                          values['DCA1_SUSTAIN'],
                          values['DCA1_RELEASE']);
            }
            else if (event.symbol.startsWith('DCF1_'))
            {
                draw_adsr(event.icon.find('[mod-role="samplv1-dcf-svg"]'),
                          values['DCF1_ATTACK'],
                          values['DCF1_DECAY'],
                          values['DCF1_SUSTAIN'],
                          values['DCF1_RELEASE']);
            }
            else if (event.symbol.startsWith('LFO1_'))
            {
                draw_adsr(event.icon.find('[mod-role="samplv1-lfo-svg"]'),
                          values['LFO1_ATTACK'],
                          values['LFO1_DECAY'],
                          values['LFO1_SUSTAIN'],
                          values['LFO1_RELEASE']);
            }
        }
    }
}

/* GLOBAL functions */
