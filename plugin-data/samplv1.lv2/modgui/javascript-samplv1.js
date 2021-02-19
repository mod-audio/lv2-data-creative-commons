function (event) {
    /* constants */
    var sd_width   = 362;
    var fil_width  = 163;
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

    function draw_filter(elem, cutoff_freq, resonance, filter_type, slope) {

        if (filter_type === undefined) {
            filter_type = 0;
        }

        if (slope === undefined) {
            slope = 0;
        }
        else if (slope == 3) {
            filter_type = 4;
        }

        var cf  = cutoff_freq * fil_width * 0.55;
        var res = resonance * -380;

        var svg = elem.svg('get');
        svg.clear();

        var data1 = [];

        switch (filter_type)
        {
            case 0: //lowpass filter
                data1.push([[-1 ,svg_height], [0,svg_height/2]]); //set start position

                var peak_length = 20;
                var slope_length = Math.floor(20 + (slope * 2));

                var x = 0;

                //straight line before cutoff freq
                for (; x < cf; x++) {
                    data1.push([x, svg_height/2]);
                }

                //draw curve for resonance peak
                var t = 0;
                for (x = Math.floor(cf); x < cf + peak_length; x++) {
                    data1.push([x, getBezierPoint(svg_height/2, svg_height/2, svg_height/2 - (svg_height/2 * resonance),
                        svg_height/2 + (res * 0.1) , t/(peak_length))]);
                    t++;
                }

                //draw slope
                t = 0;
                for (; x < cf + peak_length + slope_length; x++) {
                    data1.push([x, getBezierPoint(svg_height/2 + (res * 0.1), svg_height/2 - (svg_height/2 * resonance),
                        svg_height/2, svg_height, t/(slope_length))]);
                    t++;
                }

                //draw remaining bit
                for (; x < fil_width; x++) {
                    data1.push([x, svg_height + 10]);
                }

                break;
            case 1: //bandpass filter
                cf *= 1.2;
                var peak_length = 60;
                var slope_length = Math.floor(30 + (slope * 2));
                var slope_curve = Math.floor(slope * 2);

                var x = 0;

                for (x = 0; x < cf - slope_curve; x++) {
                    data1.push([x, svg_height + 10]);
                }
                var t = 0;
                for (; x < cf - slope_curve + peak_length; x++) {
                    data1.push([x, getBezierPoint(svg_height, svg_height/2, svg_height/2 - (svg_height/2 * resonance * 2.9),
                        svg_height, t/(peak_length))]);
                    t++;
                }
                for (; x < fil_width; x++) {
                    data1.push([x, svg_height + 10]);
                }

                data1.push([[fil_width + 1 ,svg_height/2], [fil_width + 2,svg_height]]); //set end_pos

                break;
            case 2: //highpass filter
                var peak_length = 30;
                var slope_length = Math.floor(30 + (slope * 2));
                var slope_curve = Math.floor(slope * 2);

                var x = 0;

                for (; x < cf - slope_curve; x++) {
                    data1.push([x, svg_height + 10]);
                }

                var t = 0;
                for (; x < cf - slope_curve + peak_length; x++) {
                    data1.push([x, getBezierPoint(svg_height, svg_height/2, svg_height/2 - (svg_height/2 * resonance),
                        svg_height/2 + (res * 0.1) , t/(peak_length))]);
                    t++;
                }

                t = 0;
                for (x = cf + peak_length; x < cf + peak_length + slope_length; x++) {
                    data1.push([x, getBezierPoint(svg_height/2 + (res * 0.1), svg_height/2 - (svg_height/2 * resonance),
                        svg_height/2, svg_height/2, t/(slope_length))]);
                    t++;
                }

                for (; x < fil_width; x++) {
                    data1.push([x, svg_height/2]);
                }

                data1.push([[fil_width + 1 ,svg_height/2], [fil_width + 2,svg_height]]); //set end pos
                break;
            case 3: //BRF filter
                data1.push([[-1 ,svg_height], [0,svg_height/2]]); //set start position

                var peak_length = 30;
                var slope_length = Math.floor(30 + (slope * 2));
                console.log("slope length = ", slope_length);
                var second_slope_length = 30;

                var x = 0;

                for (; x < cf; x++) {
                    data1.push([x, svg_height/2]);
                }

                var t = 0;
                for (; x < cf + peak_length; x++) {
                    data1.push([x, getBezierPoint(svg_height/2, svg_height/2, svg_height/2 - (svg_height/2 * resonance),
                        svg_height/2 + (res * 0.1) , t/(peak_length))]);
                    t++;
                }

                t = 0;
                for (; x < cf + peak_length + slope_length; x++) {
                    data1.push([x, getBezierPoint(svg_height/2 + (res * 0.1), svg_height/2 - (svg_height/2 * resonance),
                        svg_height/2, svg_height, t/(slope_length))]);
                    t++;
                }

                t = 0;
                for (; x < cf + peak_length + slope_length + second_slope_length; x++) {
                    data1.push([x, getBezierPoint(svg_height, svg_height/2, svg_height/2, svg_height/2, t/(second_slope_length))]);
                    t++;
                }

                for (; x < fil_width; x++) {
                    data1.push([x, svg_height/2]);
                }

                data1.push([[fil_width + 1 ,svg_height/2], [fil_width + 2,svg_height]]); //set end position

                break;
            case 4: //formant filter
                data1.push([[-1 ,svg_height], [0,svg_height/2]]); //set start position

                var peak_length = Math.floor(30 - (((cutoff_freq * -1) + 1) * 15));
                var n_peaks = 5;
                var offset = 8;
                //offset should rise together with resonance value
                var resonance_offset = resonance * 17;
                var offset_factor = 1 - (res * 0.001);
                var base = 10;
                var y_pos = (svg_height/2) - (base * resonance)

                for (var peak = 0; peak < n_peaks; peak++) {
                    var t = 0;
                    for (var x = Math.floor(peak_length * peak); x < Math.floor(peak_length * (peak + 1)); x++) {
                        data1.push([x, getBezierPoint(y_pos + ((offset * peak) * (offset_factor)) - resonance_offset, y_pos - resonance_offset, y_pos - (y_pos * (1 - (peak * 0.4))) - resonance_offset,
                            y_pos + ((offset * (1 + peak)) * (offset_factor)) - resonance_offset, t/(peak_length))]);
                        t++;
                    }
                }

                data1.push([x + 50, svg_height + 250]); //set end position

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
        var mono = false;

        if (sample_data === undefined) {
            data1 = [[0, 30], [400,30]];
            data2 = [[0, 85], [400,85]];
            strokeColor = '#5a5a5a';
        } else {
            if (n_channels == 2) {
                for (var x = 0; x < sample_data.length; x+=n_channels) {
                    data1.push([Math.floor((x / sample_data.length) * sd_width), (sample_data[x] * 40.0) + (svg_height / 8)]);
                    data2.push([Math.floor((x / sample_data.length) * sd_width), (sample_data[x+1] * 40.0) + (svg_height / 1.2)]);
                }
            } else {
                mono = true;
                for (var x = 0; x < sample_data.length; x+=n_channels) {
                    data1.push([Math.floor((x / sample_data.length) * sd_width), (sample_data[x] * 100.0) + (svg_height / 6)]);
                }
            }
            strokeColor = '#009515';
        }

        var defs = svg.defs();
        svg.linearGradient(defs, 'fadeBg', [[0, '#2e5033'], [1, '#1a2d1d']]);

        var g = svg.group({stroke: strokeColor, strokeWidth: 1.0, fill: 'url(#fadeBg)'});

        if (mono) {
            svg.polyline(g, data1);
        } else {
            svg.polyline(g, data1);
            svg.polyline(g, data2);
        }
    }

    function draw_adsr(elem, width, a, d, s, r) {
        var svg = elem.svg('get');
        svg.clear();

        var quarter_width = width / 4;
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
            if (symbol === 'DCF1_CUTOFF') {
                values[symbol] = event.ports[i].value;
            }

            if (symbol === 'DCF1_CUTOFF' ||
                symbol === 'DCF1_RESO' ||
                symbol === 'DCF1_SLOPE' ||
                symbol === 'DCF1_TYPE') {
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

        draw_filter(event.icon.find ('[mod-role="samplv1-filter-svg"]'),
            values['DCF1_CUTOFF'],
            values['DCF1_RESO'],
            values['DCF1_TYPE'],
            values['DCF1_SLOPE']);

        draw_adsr(dca,
            dca_width,
            values['DCA1_ATTACK'],
            values['DCA1_DECAY'],
            values['DCA1_SUSTAIN'],
            values['DCA1_RELEASE']);
        draw_adsr(dcf,
            dcf_width,
            values['DCF1_ATTACK'],
            values['DCF1_DECAY'],
            values['DCF1_SUSTAIN'],
            values['DCF1_RELEASE']);
        draw_adsr(lfo,
            lfo_width,
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
                    dca_width,
                    values['DCA1_ATTACK'],
                    values['DCA1_DECAY'],
                    values['DCA1_SUSTAIN'],
                    values['DCA1_RELEASE']);
            }
            else if (event.symbol.startsWith('DCF1_'))
            {
                draw_adsr(event.icon.find('[mod-role="samplv1-dcf-svg"]'),
                    dcf_width,
                    values['DCF1_ATTACK'],
                    values['DCF1_DECAY'],
                    values['DCF1_SUSTAIN'],
                    values['DCF1_RELEASE']);
            }
            else if (event.symbol.startsWith('LFO1_'))
            {
                draw_adsr(event.icon.find('[mod-role="samplv1-lfo-svg"]'),
                    lfo_width,
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
            event.symbol == 'DCF1_SLOPE' ||
            event.symbol == 'DCF1_TYPE') {
            var values = event.data.values;
            values[event.symbol] = event.value;
            draw_filter(event.icon.find ('[mod-role="samplv1-filter-svg"]'),
                values['DCF1_CUTOFF'],
                values['DCF1_RESO'],
                values['DCF1_TYPE'],
                values['DCF1_SLOPE']);
        }

    }
}

/* GLOBAL functions */
