const path = require('path')

module.exports = env => {
    console.log(env)
    return {
        mode: 'development',
        devtool: 'source-map',
        entry: './src/app.js',
        output: {
            filename: 'build.js',
            path: path.join(__dirname, 'dist')
        },
        watch: env.mode === "development" ? true : false,
    }
}