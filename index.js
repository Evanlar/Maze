const {Engine, World, Runner, Render, Bodies, Body,Events} = Matter;

const cellsHorizontal = 4;
const cellsVertical = 3;

const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width/cellsHorizontal;
const unitLengthY = height/cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine:engine,
    options: {
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

//walls
const walls = [
    //top
    Bodies.rectangle(width/2,0,width,4, {isStatic: true}),
    //bottom
    Bodies.rectangle(width/2,height,width,2, {isStatic: true}),
    //left
    Bodies.rectangle(0,height/2,2,width, {isStatic: true}),
    //right
    Bodies.rectangle(width,height/2,4,height, {isStatic: true})
];
World.add(world,walls);

// maze generation

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter --;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};
const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal-1).fill(false));

const horizonals = Array(cellsVertical-1).fill(null).map(() => Array(cellsHorizontal).fill(false));

//generates start location
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row,column) => {
    //if visited cell then return
    if (grid[row][column]){return;}
    //mark as visited 
    grid[row][column]=true;
    //assemble list- of neighbour
    const neighbours = shuffle([
        [row-1,column, 'up'],
        [row, column + 1,'right'],
        [row + 1, column,'down'],
        [row, column - 1,'left']
    ]);

    //for each neighbour
    for (let neighbor of neighbours){
        const [nextRow, nextColumn, direction] = neighbor;

    
    // check if neighbour out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn< 0 || nextColumn >= cellsHorizontal){
            continue;
        }
    //if we have been to that neighbour, continue to next 
        if (grid[nextRow][nextColumn]){
            continue;
        }
    // remove wall from correct array 
        if (direction === 'left'){
            verticals[row][column - 1] = true;
        }else if (direction === 'right') {
            verticals[row][column] = true; 
        }else if (direction === 'up') {
            horizonals[row - 1][column] = true;
        }else if (direction === 'down') {
            horizonals[row][column] = true;
    }
    stepThroughCell(nextRow,nextColumn);
  }
        //visit next cell
        
};

stepThroughCell(startRow,startColumn);

horizonals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {return;}

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX/2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            10,
            {   
                render: {
                    fillStyle: 'red'
                },
                label: 'wall',
                isStatic: true
            }
        );
        World.add(world,wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open,columnIndex) => {
        if (open) {return;}

        const wall = Bodies.rectangle(
            columnIndex*unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY/2,
            10,
            unitLengthY,
            {
                render: {
                    fillStyle: 'red'
                },
                label: 'wall',
                isStatic: true
            }
        );
        World.add(world,wall);
    });
});

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        render: {
            fillStyle: 'green'
        },
        label: 'goal',
        isStatic: true
    }
);
World.add(world, goal)

const ballRadius = Math.min(unitLengthX,unitLengthY) /4;
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,
    {render: {
        fillStyle: 'blue'
    },
    label:'ball'
}
);
World.add(world,ball)

document.addEventListener('keydown', event => {
    const {x,y} = ball.velocity;
    const speedLimit = 5;
    if (event.keyCode === 87 && y > -speedLimit) {
        Body.setVelocity(ball, {x, y:y-5});
    }
    if (event.keyCode === 68 && x < speedLimit) {
        Body.setVelocity(ball, {x:x+5,y});
    }
    if (event.keyCode === 83 && y < speedLimit) {
        Body.setVelocity(ball, {x, y:y+5});
    }
    if (event.keyCode === 65 && x > -speedLimit) {
        Body.setVelocity(ball, {x:x-5,y});
    }
})

// win condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision)=>{
        const labels = ['ball','goal'];

        if (
        labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)
    )   {
        document.querySelector('.winner').classList.remove('hidden');
        world.gravity.y = 1;
        world.bodies.forEach(body =>{
            console.log(body)
            if (body.label === 'wall') {
                console.log('wall detected')
                Body.setStatic(body,false);
            }
        })
    }
    });
});