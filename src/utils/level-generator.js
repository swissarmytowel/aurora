import Vector2 from 'phaser/src/math/Vector2'

export default class Level{
    constructor(width, height, roomsCount, maxFilling = 0.7){
        this.width = width,
        this.height = height,
        this.roomsCount = roomsCount,
        this.level = 0,
        this.maxFilling = maxFilling
    }

    //с помощью квадродерева накидать заданное число точек - центров комнат - на плоскость
    // создать дескрипторы для каждой из комнат
    // проверить минимальные расстояния и размеры комнат
    // застолбить (разметить) начальные комнаты
    // расширять территории, пока не заполнится % от всей площади

    // дескриптор комнаты - номер, действующий центр
    // возможно ли расширяться вверх, вниз, вправо, влево
    // максимальные значения координат слева, справа, снизу, сверху
    // закончена ли генерация комнаты
    // комнаты, с которыми есть или может быть соединение - вычисляется после генерации всех комнат

    // начальная раскидка центров комнат не влияет на их конечное положение

    // последняя комната - самая удаленная от первой. Первая необязательно в центре карты.

    // сделать генерацию комнат с помощью рандома прямоугольников
    // двигать получившийся прямоугольник от границ карты, чтобы он на нее поместился

    // переходы между комнатами - минимальное остовное дерево
    // ширина перехода - 2 тайла
    generateLevel(){
        this.level++;

        this.levelMatrix = this.generateEmptyLevel();
        const startCenters = [];
        this.quadTreeDropPoints(startCenters, this.roomsCount, 0, this.width-1, 0, this.height-1);
        let rooms = this.makeRoomsDescriptors(startCenters);
        let completedRooms = [];
        let filling = rooms.length;
        while(filling / (this.width* this.height) < this.maxFilling){
            for(let i = 0; i < rooms.length; i++) {
                filling += this.expanding(rooms[i], Math.random() < 0.5);
                // ограничения по ширине, высоте и площади опционально
                //if(rooms[i].width >= this.
            }
            this.shuffle(rooms);
        }

        //
        for(let y = 0; y < this.height; y++){
            for(let x = 0; x < this.width; x++){
                if(this.levelMatrix[y][x] === 0)
                this.levelMatrix[y][x] = " ";
                //else 
                //this.levelMatrix[y][x] = this.levelMatrix[y][x];
            }
        }
    }
    
        expanding(room, isHorizontal){
            let attachedPoints = [];
            const attachMethod = isHorizontal ? this.horAttach : this.vertAttach; 
            for(let y = room.top; y <= room.down; y++)
                for(let x = room.left; x <= room.right; x++){
                    attachedPoints = attachedPoints.concat(attachMethod(x, y, room.id, this.levelMatrix));
                }
            attachedPoints.forEach(p => {
                if(room.left > p.x)
                    room.left = p.x;
                if(room.right < p.x)
                    room.right = p.x;
                if(room.top > p.y)
                    room.top = p.y;
                if(room.down < p.y)
                    room.down = p.y;

                this.levelMatrix[p.y][p.x] = room.id;
            })

            room.square += attachedPoints.length;
            return attachedPoints.length;
        }

        shuffle(array) {
            array.sort(() => Math.random() - 0.5);
          }
    
        horAttach(x, y, id, level){
            const attached = [];
            if(x-1 >= 0 && level[y][x] === id && level[y][x-1] === 0)
                attached.push(new Vector2(x-1, y));
            if(x+1 < level[0].length && level[y][x] === id && level[y][x+1] === 0)
                attached.push(new Vector2(x+1, y));
            return attached;
        }

        vertAttach(x, y, id, level){
            const attached = [];
            if(y-1 >= 0 && level[y][x] === id && level[y-1][x] === 0)
                attached.push(new Vector2(x, y-1));
            if(y+1 < level.length && level[y][x] === id && level[y+1][x] === 0)
                attached.push(new Vector2(x, y+1));
            return attached;
        }

    makeRoomsDescriptors(startCenters){
        const descriptors = [];
        startCenters.forEach(c => {
            descriptors.push({
                startCenter: c,
                left: c.x,
                right: c.x,
                top: c.y,
                down: c.y,
                id: this.levelMatrix[c.y][c.x],
                square: 1,
                neighs: [], // stores id's of neighbours
                width : function() {
                    return this.right - this.left + 1
                },
                height : function() {
                    return this.down - this.top + 1
                }
            })
        })
        return descriptors;
    }

    // distributes total number of points just about equally
    // between four quarters of area
    getQuadrantsNums(totalNum, left, right, top, down, xCenter, yCenter){
        const quarter = Math.floor(totalNum / 4);
        const quadrantsMax = [
            (xCenter-left+1) * (yCenter-top+1), 
            (right-xCenter) * (yCenter-top+1),
            (xCenter-left+1) * (down-yCenter),
            (right-xCenter) * (down-yCenter)
        ];

        if(totalNum > (right-left+1) * (down-top+1) )
            return quadrantsMax;

        const quadrants = [];
        quadrantsMax.forEach(q => quadrants.push(q > quarter ? quarter : q));
        let rest = totalNum;
        quadrants.forEach(q => rest -= q);

        while(rest > 0){
            for(let i = 0; i < 4; i++)
                if(quadrants[i] < quadrantsMax[i]){
                    quadrants[i]++;
                    rest--;
                }
        }
        let startQuadrant = Phaser.Math.RND.integerInRange(0, 4);
        for(let i = startQuadrant; i < startQuadrant+rest; i++){
            quadrants[i%4]++;
        }
        return quadrants;
    }

    // generates distribution of points on area
    quadTreeDropPoints(points, number, left, right, top, down){
        if(number === 0) return;
        if (number === 1){
            let x = 0, y = 0;
            let notAdded = true;
            while(notAdded) {
                x = Phaser.Math.RND.integerInRange(left, right);
                y = Phaser.Math.RND.integerInRange(top, down);
                if(this.levelMatrix[y][x] < 1)
                    notAdded = false;
            }
            points.push(new Vector2(x, y));
            this.levelMatrix[y][x] = points.length;
        } else {
            const xCenter = Math.floor((right + left) / 2);
            const yCenter = Math.floor((down + top) / 2);
            const quadrants = this.getQuadrantsNums(number, left, right, top, down, xCenter, yCenter);
            this.quadTreeDropPoints(points, quadrants[0], left, xCenter, top, yCenter);
            this.quadTreeDropPoints(points, quadrants[1], xCenter+1, right, top, yCenter);
            this.quadTreeDropPoints(points, quadrants[2], left, xCenter, yCenter+1, down);
            this.quadTreeDropPoints(points, quadrants[3], xCenter+1, right, yCenter+1, down);
        }
    }

    // initial filling of level matrix
    generateEmptyLevel(){ 
        const emptyLevel = [];
        for(let y = 0; y < this.height; y++){
            let col = [];
            for (let x = 0; x < this.width; x++)
                col.push(0);
            emptyLevel.push(col);
        }
        return emptyLevel;
    }

    print(){
        console.log("\n");
        for(let y = 0; y < this.height; y++){
            let str = "";
            for(let x = 0; x < this.width; x++){
                str += this.levelMatrix[y][x] + " ";
            }
            console.log(str + "\n");
        }
    }
}