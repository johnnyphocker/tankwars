/***************
VARIABLES
****************/
var canvas, ctx;
var x, y;
var imagen;
var radianes;
var BARRA = 32;
var teclaPulsada = null;
var tecla_array = new Array();
var balas_array = new Array();
var enemigos_array = new Array();
var colorEnemigo = ["black"/*"red", "blue", "black", "yellow", "orange", "purple"*/];
var colorBala = "red";
var centroX, centroY;
var w,h;
var puntos = 0;
var vidas = 3;
var finJuego = false;

/**************
CLASES
**************/
function Bala(x,y,radianes){
	this.x = x;
	this.y = y;
	this.w = 5;
	this.speed = 8;
	this.radianes = radianes;
	this.dibuja = function(){
		ctx.save();
		ctx.fillStyle = colorBala;
		this.x += Math.cos(this.radianes)*this.speed;
		this.y += Math.sin(this.radianes)*this.speed;
		ctx.fillRect(this.x, this.y, this.w, this.w);
		ctx.restore();
	}
}
function Tanque(x,y,radio){
	this.x = x;
	this.y = y;
	this.radio = radio;
	this.escala = 1;
	this.rotacion = 0;
	this.w = 0;
	this.h = 0;
	this.dibuja = function(){
		imagen.src = "imagenes/tanque.png";
		imagen.onload = function(){
			this.w = imagen.width;
			this.h = imagen.height;
			var ww = this.w / 2;
			var hh = this.h / 2;
			ctx.drawImage(imagen, centroX-ww, centroY-hh);
		}
	}
}
function Enemigo(x,y){
	this.n = 0;
	this.x = x;
	this.y = y;
	this.inicioX = x;
	this.inicioY = y;
	this.estado = 1;
	this.r = 10;
	this.w = this.r * 2;
	this.isAlive = true;
	this.bullet = new Image();
	this.bullet.src = 'imagenes/missile/1.png';
	this.speed = .3+Math.random();
	this.color = colorEnemigo[Math.floor(Math.random()*colorEnemigo.length)];
	this.dibuja = function(){
		if(this.n<100 && this.isAlive){
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
			ctx.fill();
			//ctx.drawImage(this.bullet,this.x,this.y,this.width,this.height);
			this.n+=this.speed;
			this.x = centroX*this.n/100 + this.inicioX*(100-this.n)/100;
			this.y = centroY*this.n/100 + this.inicioY*(100-this.n)/100;
			ctx.restore();
		}
	}
}

/****************
FUNCIONES
****************/
function anima(){
	if(finJuego==false){
		requestAnimationFrame(anima);
		verifica();
		draw();
		colisiones();
	}
}
function colisiones(){
	for(var i=0; i<enemigos_array.length; i++){
		for(var j=0; j<balas_array.length; j++){
			enemigo = enemigos_array[i];
			bala = balas_array[j];
			if(enemigo != null && bala != null){
				if(bala.x>enemigo.x &&
				bala.x<enemigo.x+enemigo.w &&
				bala.y>enemigo.y &&
				bala.y<enemigo.y+enemigo.w){
					enemigo.isAlive = false;
					enemigos_array[i] = null;
					balas_array[j] = null;
					puntos +=10;
					boing.play();
				}
			}
		}
		if(enemigos_array[i] != null){
			enemigo = enemigos_array[i];
			if(enemigo.n > 95){
				enemigo.isAlive = false;
				enemigos_array[i] = null;
				vidas--;
				boom.play();
				if(vidas==0) gameOver();
			}
		}
	}
}
function score(){
	ctx.save();
	ctx.fillStyle = "white";
	ctx.clearRect(0,0,canvas.width,40);
	ctx.font = "bold 20px Avenir";
	ctx.fillText("SCORE: "+puntos+" VIDAS: "+vidas,10,20);
	ctx.restore();
}
function gameOver(){
	mensaje("Game Over");
	finJuego = true;
	fin.play();
}
function verifica(){
	if(tecla_array[BARRA]){
		balas_array.push(new Bala(centroX+Math.cos(radianes)*35,
		centroY+Math.sin(radianes)*35, radianes));
		tecla_array[BARRA] = false;
		disparo.play();
	}
}
function draw(){
	ctx.clearRect(0,0,canvas.width, canvas.height);
	ctx.save();
	ctx.translate(centroX, centroY);
	ctx.scale(tanque.escala, tanque.escala);
	ctx.rotate(radianes);
	ctx.drawImage(imagen, -imagen.width/2, -imagen.height/2);
	ctx.restore();
	
	for(var i=0; i<balas_array.length; i++){
		if(balas_array[i]!=null){
			balas_array[i].dibuja();
			if(balas_array[i].x < 0 || balas_array[i].x > w || balas_array[i].y <0
			|| balas_array[i].y > h){
				balas_array[i] = null;
			}
		}
	}

	for(var i=0; i<enemigos_array.length; i++){
		if(enemigos_array[i] != null){
			enemigos_array[i].dibuja();
		}
	}
	score();
}
function inicio(){
	tanque.dibuja();
	setTimeout(lanzaEnemigo, 1000);
	anima();
}
function lanzaEnemigo(){
	var lado = Math.floor(Math.random()*4)+1;
	if(lado==1){
		x = -10;
		y = Math.floor(Math.random()*h);
	} else if(lado==2){
		x = Math.floor(Math.random()*w);
		y = -10;
	} else if(lado==3){
		x = w + Math.random()*10;
		y = Math.floor(Math.random()*h);
	} else if(lado==4){
		x = Math.floor(Math.random()*w);
		y = h + Math.random()*10;
	}
	enemigos_array.push(new Enemigo(x,y));
	setTimeout(lanzaEnemigo, 2000);
}
function ajusta(xx, yy){
	var pos = canvas.getBoundingClientRect();
	var x = xx - pos.left;
	var y = yy - pos.top;
	return {x:x, y:y}
}
function mensaje(cadena){
	var lon = (canvas.width-(53*cadena.length))/3;
	ctx.save();
	ctx.fillStyle = "black";
	ctx.clearRect(0,0,w,h);
	ctx.font = "bold 100px Arial";
	ctx.fillText(cadena,lon, 220);
	ctx.restore();
}

/****************
LISTENERS
****************/
document.addEventListener("keydown", function(e){
	teclaPulsada = e.keyCode;
	tecla_array[teclaPulsada] = true;
});
window.requestAnimationFrame=(function(){
	return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback){window.setTimeout(callback,17);}
})();
document.addEventListener("mousemove",function(e){
	var pos = ajusta(e.clientX, e.clientY);
	var x = pos.x;
	var y = pos.y;
	var dx = x - centroX;
	var dy = y - centroY;
	radianes = Math.atan2(dy,dx);
});

window.onload = function(){
	canvas = document.getElementById("canvas");
	if(canvas && canvas.getContext){
		ctx = canvas.getContext("2d");
		if(ctx){
			var boing = document.getElementById("boing");
			var disparo = document.getElementById("disparo");
			var intro = document.getElementById("intro");
			var fin = document.getElementById("fin");
			var boom = document.getElementById("boom");
			intro.play();
			w = canvas.width;
			h = canvas.height;
			centroX = w / 2;
			centroY = h / 2;
			imagen = new Image();
			tanque = new Tanque();
			mensaje("TANK WARS");
			setTimeout(inicio, 3500);
		} else {
			alert("Error al crear tu contexto");
		}
	}
}
