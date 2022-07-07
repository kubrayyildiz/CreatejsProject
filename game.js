var stage, loader, flappy;
var started = false;
var polygon;
function init() {
  stage = new createjs.Stage("gameCanvas"); //olan tuvale dayalı easelJs senaryosu oluşturur.
  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED; //ticker=alt ögeyi güncellemek ve güncellemeyi kullanarak yeniden aşama çizer.
  createjs.Ticker.framerate = 60; //saniyedeki görüntü sayısı
  createjs.Ticker.addEventListener("tick", stage); //Belirtilen olay dinleyicisini ekler.
  var background = new createjs.Shape(); //Şekil, vektör resmini görüntüleme listesinde görüntülemenizi sağlar.
  background.graphics //vektör çizim talimatları oluşturmak ve bunları belirli bir bağlamda çizmek için
    .beginLinearGradientFill(
      ["#2573BB", "#6CB8DA", "#567A32"],
      [0, 0.85, 1],
      0,
      0,
      0,
      480
    )
    .drawRect(0, 0, 320, 480);
  background.x = 0;
  background.y = 0;
  background.name = "background";
  background.cache(0, 0, 320, 480);
  stage.addChild(background);

  var manifest = [
    { src: "cloud.png", id: "cloud" },
    { src: "flappy.png", id: "flappy" },
    { src: "pipe.png", id: "pipe" },
  ];
  loader = new createjs.LoadQueue(true); // içeriği önceden yüklemek için ana API'dir
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest, true, "./img/"); //Yükleyici tamamlanmadan önce manifest içindeki öğeler yüklenir.
}

function handleComplete() {
  //bir sıra tüm dosyaları yüklemeyi tamamladığında tetiklenir
  createClouds();
  createFlappy();
  stage.on("stagemousedown", jumpFlappy);
  createjs.Ticker.addEventListener("tick", checkColllision);
  stage.addChild(polygon); //görüntülenme listesine ekler
  polygon = new createjs.Shape();
}
function createClouds() {
  var clouds = [];
  for (var i = 0; i < 3; i++) {
    clouds.push(new createjs.Bitmap(loader.getResult("cloud"))); //Bitmap, görüntüleme listesindeki bir Resmi, Tuvali veya Videoyu temsil eder..
  }
  clouds[0].x = 40;
  clouds[0].y = 20;
  clouds[1].x = 140;
  clouds[1].y = 70;
  clouds[2].x = 100;
  clouds[2].y = 130;
  for (var i = 0; i < 3; i++) {
    var directionMultiplier = i % 2 == 0 ? -1 : 1;
    var originalX = clouds[i].x;
    createjs.Tween.get(clouds[i], { loop: true }) //Tek bir hedef için özelliklerin arasını doldurur.
      .to(
        { x: clouds[i].x - 200 * directionMultiplier },
        3000,
        createjs.Ease.getPowInOut(2) //Ease sınıfı, TweenJS ile kullanım için bir hareket hızı işlevleri koleksiyonu sağlar.
      )
      .to({ x: originalX }, 3000, createjs.Ease.getPowInOut(2));
    stage.addChild(clouds[i]);
  }
}
function createFlappy() {
  flappy = new createjs.Bitmap(loader.getResult("flappy"));
  flappy.regX = flappy.image.width / 2;
  flappy.regY = flappy.image.height / 2;
  flappy.x = stage.canvas.width / 2;
  flappy.y = stage.canvas.height / 2;
  stage.addChild(flappy);
}
function jumpFlappy() {
  if (!started) {
    startGame();
  }
  createjs.Tween.get(flappy, { override: true })
    .to({ y: flappy.y - 60, rotation: -10 }, 500, createjs.Ease.getPowOut(2))
    .to(
      { y: stage.canvas.height + flappy.image.width / 2, rotation: 30 },
      1500,
      createjs.Ease.getPowIn(2)
    )
    .call(gameOver);
}
function createPipes() {
  var topPipe, bottomPipe;
  var position = Math.floor(Math.random() * 280 + 100);
  topPipe = new createjs.Bitmap(loader.getResult("pipe"));
  topPipe.y = position - 75;
  topPipe.x = stage.canvas.width + topPipe.image.width / 2;
  topPipe.rotation = 180;
  topPipe.name = "pipe";

  bottomPipe = new createjs.Bitmap(loader.getResult("pipe"));
  bottomPipe.y = position + 75;
  bottomPipe.x = stage.canvas.width + bottomPipe.image.width / 2;
  bottomPipe.skewY = 180;
  bottomPipe.name = "pipe";
  topPipe.regX = bottomPipe.regX = topPipe.image.width / 2;
  createjs.Tween.get(topPipe)
    .to({ x: 0 - topPipe.image.width }, 10000)//Nesnenin konuma 0-pipe yüksekliğinin  katları halinde hareket edeceğini ve on saniye süreceğini belirtir.
    .call(function () {
      removePipe(topPipe);
    });
  createjs.Tween.get(bottomPipe)//Nesnenin canlandırılacağını ve bunu tekrarlamak için true loop seçeneğini belirtir.
    .to({ x: 0 - bottomPipe.image.width }, 10000)
    .call(function () {
      removePipe(bottomPipe);
    });

  stage.addChild(bottomPipe, topPipe);//figür eklendi ama siteyi açarsak hiçbir şey göremeyiz çünkü senaryo o figürün güncelleme yöntemi çağrılıncaya kadar görsel değişiklikleri yansıtmaz.

}
function removePipe(pipe) {
  stage.removeChild(pipe);
}
function startGame() {
  started = true;
  createPipes();
  setInterval(createPipes, 6000);
}
function checkColllision() {
  var leftX = flappy.x - flappy.regX + 5;
  var leftY = flappy.y - flappy.regY + 5;
  var points = [
    new createjs.Point(leftX, leftY),
    new createjs.Point(leftX + flappy.image.width - 10, leftY),
    new createjs.Point(leftX, leftY + flappy.image.height - 10),
    new createjs.Point(
      leftX + flappy.image.width - 10,
      leftY + flappy.image.height - 10
    ),
  ];
  polygon.graphics.clear().beginStroke("black");
  polygon.graphics
    .moveTo(points[0].x, points[0].y)
    .lineTo(points[2].x, points[2].y)
    .lineTo(points[3].x, points[3].y)
    .lineTo(points[1].x, points[1].y)
    .lineTo(points[0].x, points[0].y);
  for (var i = 0; i < points.length; i++) {
    var objects = stage.getObjectsUnderPoint(points[i].x, points[i].y);
    if (objects.filter((object) => object.name == "pipe").length > 0) {
      gameOver();
      return;
    }
  }
}
function gameOver() {
  createjs.Tween.removeAllTweens();
  alert("Game Over!");
}
