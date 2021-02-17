require( 'dotenv' ).config();

module.exports = {
	mode: 'spa',
	/*
	 ** Headers of the page
	 */
	head: {
		title: process.env.page_title || 'El tiempo',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{
				hid: 'El tiempo',
				name: 'El tiempo',
				content: process.env.npm_package_description || ''
			},
			{ hid: 'author', name: 'author', content: 'https://sentidoweb.com/' },
		],
		link: [{ rel: 'icon', type: 'image/svg', href: '/favicon.svg' }]
	},
	/*
	 ** Customize the progress-bar color
	 */
	loading: { color: '#fff' },
	/*
	 ** Global CSS
	 */
	css: [
		'@/assets/scss/style.scss'
	],
	/*
	 ** Plugins to load before mounting the App
	 */
	plugins: [
		{ src: '~/plugins/coreui', mode: 'client' },
		{ src: '~/plugins/coreui-icons', mode: 'client' }
	],
	/*
	 ** Nuxt.js dev-modules
	 */
	buildModules: [
		// Doc: https://github.com/nuxt-community/eslint-module
		'@nuxtjs/eslint-module',
		'@nuxtjs/dotenv',
	],
	/*
	 ** Nuxt.js modules
	 */
	modules: [
		// Doc: https://bootstrap-vue.js.org
		'bootstrap-vue/nuxt',
		// Doc: https://axios.nuxtjs.org/usage
		'@nuxtjs/axios',
		'@nuxtjs/pwa',
		'@nuxtjs/axios',
	],
	/*
	 ** Axios module configuration
	 ** See https://axios.nuxtjs.org/options
	 */
	axios: {},
	/*
	 ** Build configuration
	 */
	build: {
		/*
		 ** You can extend webpack config here
		 */
		// extend(config, ctx) {}
	},
}
