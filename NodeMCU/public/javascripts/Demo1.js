$(document).ready(()=>{ // jQuery main

    const TREE_SCALE_X=1.9;
    const TREE_SCALE_Y=1.9;
    const TREE_X=0;
    const TREE_Y=0;

    let stage = new createjs.Stage(canvas);
    let repo = new createjs.LoadQueue();
    let light_sum = 0;

    function setup() {
        // automatically update
        createjs.Ticker.on("tick", e => stage.update()); //每次更新呼叫這個函式
        createjs.Ticker.framerate = 60; // 一秒鐘更新六十次
        repo.loadManifest([{id:'tree0',src:"../images/seed.gif"},
            {id:'tree1',src:"../images/GreenLeaf.gif"},
            {id:'tree2',src:"../images/RedLeaf.gif"},
            {id:'tree3',src:"../images/Wither.gif"},
            {id:'bug',src:"../images/bug.png"},
            {id:'success',src:"../images/success.png"},
            {id:'fail',src:"../images/fail.png"},
            {id:'failbgm',src:"../audios/game_fail.mp3"}
        ]);

        repo.on('complete', main); // Wait until all assets are loaded
    }

    function main(){
        let bound = new createjs.Shape();
        stage.addChild(bound);

        let tree = [new createjs.Bitmap(repo.getResult('tree0')),
            new createjs.Bitmap(repo.getResult('tree1')),
            new createjs.Bitmap(repo.getResult('tree2')),
            new createjs.Bitmap(repo.getResult('tree3'))
        ];

        /* Grow up tree */
        let t = 0;
        let light = 0;
        tree[light].set({scaleX: TREE_SCALE_X, scaleY: TREE_SCALE_Y});
        tree[light].set({x: TREE_X, y: TREE_Y});
        stage.addChild(tree[light]);
        let intervalId = null;

        let growTree = function() {
            // 600 1500 2000
            if (light_sum <= 600) {
                light = 0
                tree[light].set({scaleX: TREE_SCALE_X, scaleY: TREE_SCALE_Y});
                tree[light].set({x: TREE_X, y: TREE_Y});
                stage.addChildAt(tree[light], 0);
            }
            else if (light_sum > 600 && light_sum <= 1500) {
                stage.removeChild(tree[light]);
                light = light < 1 ? light + 1 : light;
                tree[light].set({scaleX: TREE_SCALE_X*1.6, scaleY: TREE_SCALE_Y*1.6});
                tree[light].set({x: TREE_X, y: TREE_Y});
                stage.addChildAt(tree[light], 0);
            }
            else if (light_sum > 1500 && light_sum <= 2000) {
                stage.removeChild(tree[light]);
                light = light < 2 ? light + 1 : light;
                tree[light].set({scaleX: TREE_SCALE_X*1.6, scaleY: TREE_SCALE_Y*1.6});
                tree[light].set({x: TREE_X, y: TREE_Y});
                stage.addChildAt(tree[light], 0);
                document.getElementById('finish_img').src="../images/success.png";
                document.getElementById('msg').innerText="Congratulation!";
                document.getElementById('dialog').style.display = "initial";
                clearInterval(intervalId);
                clearInterval(lightInterval);
                clearInterval(hazard);
            }

            /* Too many bug then dead */
            if (count > 10) {
                stage.removeChild(tree[light]);
                light = 3;
                tree[light].set({scaleX: TREE_SCALE_X*1.6, scaleY: TREE_SCALE_Y*1.6});
                tree[light].set({x: TREE_X, y: TREE_Y});
                stage.addChildAt(tree[light], 0);
                document.getElementById('finish_img').src="../images/fail.png";
                document.getElementById('msg').innerText="It's dead!";
                document.getElementById('dialog').style.display = "initial";

                repo.getResult('failbgm').play();
                clearInterval(intervalId);
                clearInterval(lightInterval);
            }
        }
        intervalId = setInterval(growTree, 2000);

        /* Bug Hazard */
        let count = 0;
        let hazard = null;
        let bugEvent= function(){
            let bug = new createjs.Bitmap(repo.getResult('bug'));

            bug.set({scaleX:0.3,scaleY:0.3});
            bug.set({x:1000 + Math.floor(Math.random()*1000)%470,
                y:700+Math.floor(Math.random()*1000)%130});
            stage.addChild(bug);
            console.log("bug : "+ count++);
            createjs.Tween.get(bug).to({x:bug.x+(100-Math.floor(Math.random()*200)),
                y:bug.y+(100-Math.floor(Math.random()*200))},20000);
            bug.on('click',() => {
                count--;
                stage.removeChild(bug);
            });
            if(count>10)
            {
                clearInterval(hazard);
            }
        }
        hazard = setInterval(bugEvent,3000);
    }

    setup();

    let lightInterval = setInterval(function(){
        $.get("/light", function(data){
            console.log(data.light);
            light_sum += (parseInt(data.light) + 50);

            $("#light-val").text(light_sum);
        })
    }, 1500);
});
