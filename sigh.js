var glob, write; // built-in
var babel; // sigh-babel

module.exports = function (pipelines) {
    pipelines['build-source'] = [
        glob({basePath: 'src/js'}, '**/*.js'),
        babel({modules: 'common'}),
        write({clobber: true}, 'dist')
    ];
};


