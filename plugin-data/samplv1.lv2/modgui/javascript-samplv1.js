function (event) {
    /* constants */
    var sd_width   = 362;
    var fil_width  = 164;
    var dca_width  = 98;
    var dcf_width  = 98;
    var lfo_width  = 153;
    /* common */
    var svg_height = 78;
    var sd_height  = 118;

    function switch_waveform_image(index) {
        var backgroundPositions = ['0px', '-80px', '-158px', '-237px', '-316px'];
        var backgroundPosition = '0px' + ' ' + backgroundPositions[index];

        event.icon.find(".wave-forms").css({
            'background-position' : backgroundPosition
        });
    }

    function getBezierPoint(P0, P1, P2, P3, t)
    {
        return Math.pow(1 - t, 3) * P0 + 3 * t * Math.pow(1 - t, 2) * P1 + 3 * Math.pow(t, 2) * (1 - t) * P2 + Math.pow(t, 3) * P3;
    }

    function draw_filter(elem, cutoff_freq, resonance, filter_type) {

        if (filter_type === undefined) {
            filter_type = 0;
        }

        var cf  = cutoff_freq * fil_width * 0.45;
        var res = resonance * -380;

        var svg = elem.svg('get');
        svg.clear();

        var data1 = [];

        switch (filter_type)
        {
            case 0:
                data1.push([[-1 ,svg_height], [0,svg_height/2]]); //set start position

                var peak_length = 30;
                var slope_length = 30;

                //straight line before cutoff freq
                for (var x = 0; x < cf; x++) {
                    data1.push([x, svg_height/2]);
                }
                //draw curve for resonance peak
                var t = 0;
                for (var x = Math.floor(cf); x < cf + peak_length; x++) {
                    data1.push([x, getBezierPoint(svg_height/2, svg_height/2, svg_height/2 - (svg_height/2 * resonance), svg_height/2 + (res * 0.1) , t/(peak_length))]);
                    t++;
                }
                //draw slope
                t = 0;
                for (var x = cf + peak_length; x < cf + peak_length + slope_length; x++) {
                    data1.push([x, getBezierPoint(svg_height/2 + (res * 0.1), svg_height/2 - (svg_height/2 * resonance), svg_height/2, svg_height, t/(slope_length))]);
                    t++;
                }
                //draw remaining bit
                for (var x = cf + peak_length + slope_length; x < fil_width; x++) {
                    data1.push([x, svg_height + 10]);
                    t++;
                }

                break;
            default:
        }

        strokeColor = '#009515';

        var defs = svg.defs();
        svg.linearGradient(defs, 'fadeBg', [[0, '#2e5033'], [1, '#1a2d1d']]);
        var g = svg.group({stroke: strokeColor, strokeWidth: 1.0, fill: 'url(#fadeBg)'});


        svg.polyline(g, data1);
    }

    function draw_sample(elem, n_channels) {
        var ds = sd.data ('xModPorts');
        var svg = elem.svg('get');
        svg.clear();

        var sample_data = ds['http://samplv1.sourceforge.net/lv2#P109_WAVE_FORM'];
        var data1 = []; //data for left channel or mono
        var data2 = []; //data for right channel

        if (sample_data === undefined) {
            data1 = [[0, 50], [400,50]];
            strokeColor = '#5a5a5a';
        } else {
            if (n_channels == 2) {
                for (var x = 0; x < sample_data.length; x+=n_channels) {
                    data1.push([Math.floor((x / sample_data.length) * sd_width), (sample_data[x] * 40.0) + (svg_height / 8)]);
                    data2.push([Math.floor((x / sample_data.length) * sd_width), (sample_data[x+1] * 40.0) + (svg_height / 1.2)]);
                }
            } else {
                for (var x = 0; x < sample_data.length; x+=n_channels) {
                    data1.push([Math.floor((x / sample_data.length) * sd_width), (sample_data[x] * 100.0) + (svg_height / 6)]);
                }
            }
            strokeColor = '#009515';
        }

        var defs = svg.defs();
        svg.linearGradient(defs, 'fadeBg', [[0, '#2e5033'], [1, '#1a2d1d']]);

        var g = svg.group({stroke: strokeColor, strokeWidth: 1.0, fill: 'url(#fadeBg)'});

        if (n_channels == 2) {
            svg.polyline(g, data1);
            svg.polyline(g, data2);
        } else {
            svg.polyline(g, data1);
        }
    }

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
        var g = svg.group({stroke: '#009515', strokeWidth: 1.0, fill: 'url(#fadeBg)'});
        svg.polygon(g, path, {});
    }

    function setup_svg(elem, width, height) {
        // enable svg element
        elem.svg();
        // setup svg size
        var svg = elem.svg('get');
        svg.configure({width: '' + width + 'px'}, false);
        svg.configure({height: '' + height + 'px'}, false);
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

            if (symbol === 'LFO1_SHAPE')
            {
                switch_waveform_image(event.ports[i].value);
            }
            if (symbol == 'DCF1_CUTOFF') {
                values[symbol] = event.ports[i].value;
            }
        }

        // get elements
        var sd  = event.icon.find('[mod-role=samplv1-sample-svg]');
        var fil = event.icon.find('[mod-role=samplv1-filter-svg]');
        var dca = event.icon.find('[mod-role="samplv1-dca-svg"]');
        var dcf = event.icon.find('[mod-role="samplv1-dcf-svg"]');
        var lfo = event.icon.find('[mod-role="samplv1-lfo-svg"]');

        // setup svgs
        setup_svg(sd,  sd_width,  sd_height);
        setup_svg(fil, fil_width, svg_height);
        setup_svg(dca, dca_width, svg_height);
        setup_svg(dcf, dcf_width, svg_height);
        setup_svg(lfo, lfo_width, svg_height);

        // initial drawing
        var ds = {};
        sd.data ('xModPorts', ds);
        draw_sample(sd, 1);

        draw_filter(fil, values['DCF1_CUTOFF'], 0, 0);

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
        var n_channels;
        var sd = event.icon.find ('[mod-role="samplv1-sample-svg"]');
        var ds = sd.data ('xModPorts');

        if (event.uri == 'http://samplv1.sourceforge.net/lv2#P109_WAVE_FORM') {
            if (event.value.length == 512) {
                n_channels = 2;
            }
            else if (event.value.length == 256) {
                n_channels = 1;
            } else {
                console.log("modspectre: Invalid data")
                return
            }
            ds[event.uri] = event.value;

            sd.data ('xModPorts', ds);
            draw_sample(sd, n_channels);
        }


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
            /**/
            if (event.symbol.startsWith('DCA1_'))
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

        if (event.symbol === "LFO1_SHAPE")
        {
            switch_waveform_image(event.value);
        }

        if (event.symbol == 'DCF1_CUTOFF' ||
            event.symbol == 'DCF1_RESO' ||
            event.symbol == 'DCF1_SLOP' ||
            event.symbol == 'DCF1_TYPE') {
            var values = event.data.values;
            values[event.symbol] = event.value;
            draw_filter(event.icon.find ('[mod-role="samplv1-filter-svg"]'), values['DCF1_CUTOFF'],
                values['DCF1_RESO'], values['DCF1_TYPE']);
        }

    }
}

/* GLOBAL functions */
