import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * @param {*} url
 * https://discourse.threejs.org/t/most-simple-way-to-wait-loading-in-gltf-loader/13896
 */

function modelLoader(loader, url) {
	return new Promise((resolve, reject) => {
		loader.load(url, (data) => resolve(data), null, reject);
	});
};

class ParticlesLogo {

	constructor(options) {
		this.scene = new THREE.Scene();
		this.container = options.element;

		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;

		this.renderer = new THREE.WebGLRenderer({
			antialias: false,
			alpha: true,
			canvas: this.container
		});
		this.renderer.setPixelRatio(Math.max(2, window.devicePixelRatio));
		this.renderer.setSize(this.width, this.height);
		this.renderer.setClearColor('#000000');

		this.camera = new THREE.PerspectiveCamera(
			35,
			this.width / this.height,
			0.1,
			2000
		);
		this.camera.position.set(0, 1, 550);

		this.loader = new GLTFLoader();

		this.mouseX = 0;
		this.mouseY = 0;
		this.mouse = new THREE.Vector2();
		this.uTime = 0;
		this.fragmentShader = options.fragmentShader;
		this.vertexShader = options.vertexShader;
		this.logoGeometry;
		this.body = document.querySelector('body');

		modelLoader(this.loader, './logo.glb').then((res) => {
			this.logoGeometry = res.scene.children[0].geometry;

			this.setupResize();
			this.onMouseMove();
			this.addLogo();
			this.render();
			this.onClick();
		});
	};

	setupResize () {
		window.addEventListener('resize', this.resize.bind(this));
	};

	resize () {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.renderer.setSize(this.width, this.height);
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
	};

	addLogo () {
		this.particlesMaterial = new THREE.ShaderMaterial({
			vertexColors: true,
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			uniforms: {
				uTime: { value: 1 },
				uMouse: { value: this.mouse },
				screenWidth: { value: this.width },
				screenHeight: { value: this.height }
			}
		});
		this.random = new Float32Array(this.logoGeometry.attributes.position.count);

		for (let i = 0; i < this.random.length; i++) {
			this.random[i] = Math.random() * 1 + 0.1;
		};

		this.logoGeometry.setAttribute('random', new THREE.BufferAttribute(this.random, 1));

		this.particles = new THREE.Points(
			this.logoGeometry,
			this.particlesMaterial
		);

		this.particles.rotateY(Math.PI / 2);
		this.particles.rotateX(Math.PI / 2);
		this.particles.rotateZ(Math.PI / 2);
		this.scene.add(this.particles);
	};

	onMouseMove() {
		window.addEventListener('mousemove', (event) => {
			this.mouseX = (event.clientX - this.width * 0.5) * 0.5;
			this.mouseY = (event.clientY - this.height * 0.5) * 0.5;
			this.mouse.x = event.pageX;
			this.mouse.y = event.pageY;
		});
	};

	onClick() {
		document.addEventListener('click', () => {
			this.particlesMaterial.uniforms.uTime.value = 0;
		});
	};

	render() {
		this.camera.position.x += (this.mouseX * 0.8 - this.camera.position.x) * 0.1;
		this.camera.position.y += (-(this.mouseY * 0.8) - this.camera.position.y) * 0.1;
		this.camera.lookAt(this.scene.position);
		this.renderer.render(this.scene, this.camera);
		this.particlesMaterial.uniforms.uTime.value += 1.0;

		window.requestAnimationFrame(this.render.bind(this));
	};
};

new ParticlesLogo({
	element: document.querySelector('canvas'),
	vertexShader: document.querySelector('#vertexShader').innerHTML,
	fragmentShader: document.querySelector('#fragmentShader').innerHTML
});