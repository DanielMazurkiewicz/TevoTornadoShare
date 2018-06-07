function getElement() {
    var quality = 0.5;

    var thickness = 10;
    var baseWidth = 110;
    var keeperLocation = 35;
    var keepersWidth = 20;
    var filamantHeightToCenter = 130;
    var filamentWidth = 110;
    var baseHole = 6;
    var keeperNeil = 4;
    
    var baseHoles = function(lay){
        lay.remove(getCircle(baseHole/2, [thickness/2, baseWidth-thickness/2]))
        lay.remove(getCircle(baseHole/2, [thickness*1.5 + filamentWidth, baseWidth-thickness/2]))
    }
    
    var base = (new Path())
    .start()
    .line(baseWidth)
    .round(2)
    .line(thickness, 90)
    .round(2)
    .line(keeperLocation, 90)
    .round(2)
    .line(filamentWidth, -90)
    .round(2)
    .line(keeperLocation, -90)
    .round(2)
    .line(thickness, 90)
    .round(2)
    .line(baseWidth, 90)
    .line(thickness, 90)
    .line(baseWidth - keeperLocation - keepersWidth, 90)
    .round(2)
    .line(filamentWidth, -90)
    .round(2)
    .line(baseWidth - keeperLocation - keepersWidth, -90)
    .close(true)

    var side = (new Path())
    .start()
    .line(filamantHeightToCenter)
    .round(2)
    .line(keepersWidth/2-keeperNeil/2, 90)
    .line(keeperNeil/4, 90)
    .arc(keeperNeil/2, -180)
    .line(keeperNeil/4)
    .line(keepersWidth/2-keeperNeil/2, 90)
    .round(2)
    .line(filamantHeightToCenter, 90)
    .close(true)

    var sides = function(lay) {
        var sideObject = (new Layers())
            .from(0)
            .thick(thickness)
            .add(side)
            .toJsCad(quality)
            .rotateZ(90).rotateY(90)
            .translate([0, baseWidth - keeperLocation - keepersWidth, thickness])

        lay.add(sideObject)
        lay.add(sideObject.translate([thickness+filamentWidth, 0, 0]))
    }

    var layers = (new Layers())

        .from(0)
        .thick(thickness)
        .add(base)
        .include(baseHoles)
        .include(sides)


    return layers.toJsCad(quality);
}

function getGear(toothNumber, parameters, atPosition) {
    atPosition = atPosition || [0, 0];
    toothNumber = toothNumber || 3;
    parameters = parameters || 'htd3m';
    
    
    var predefinedParameters = {
        htd3m: {
            type: 'arc',
            chainThikness: 2.4,
            toothPitch: 3,

            bottomRadius: 0.89, //0.87
            topCornerRadius: 0.25,
            toothDepth: 1.22
        },
        mojeCnc: {
            type: 'square',
            chainThikness: 4,
            toothPitch: 10,

            bottomLength: 4,
            topCornerRadius: 0.6,
            bottomCornerRadius: 0.5,
            toothDepth: 2
        }
    }
    
    if (typeof parameters === 'string') {
        parameters = predefinedParameters[parameters];
    }
    

    var chainThikness = parameters.chainThikness;
    var toothPitch = parameters.toothPitch;

    if (parameters.bottomLength !== undefined) {
        var bottomLength = parameters.bottomLength;
        var bottomRadius = bottomLength / 2;
    } else if (parameters.bottomRadius !== undefined) {
        var bottomRadius = parameters.bottomRadius;
        var bottomLength = bottomRadius * 2;
    }
    var topCornerRadius = parameters.topCornerRadius;
    var bottomCornerRadius = parameters.bottomCornerRadius;
    var toothDepth = parameters.toothDepth;

    switch (parameters.type) {
        case 'arc':
            var toothPath = (new Path())
                .start()
                .round(topCornerRadius)
                .line(toothDepth - bottomRadius)
                .arc(bottomRadius, -180)
                .line(toothDepth - bottomRadius)
                .round(topCornerRadius)
            break;
  
        case 'square':
            var toothPath = (new Path())
                .start()
                .round(topCornerRadius)
                .line(toothDepth)
                .round(bottomCornerRadius)
                .line(bottomLength, -90)
                .round(bottomCornerRadius)
                .line(toothDepth, -90)
                .round(topCornerRadius)
            break;
    }


    var path = toothPath;


    var gearRadius = (toothPitchStraightLengthOnCircle / 2) / Math.sin((Math.PI / 180) * toothAngle);


    var toothTopLineLength = toothPitch - bottomLength;

    var toothAngle = (360 / toothNumber) / 2;
    var startPoint = [0, 0];
    var endPoint = (new Path())
        .start(startPoint)
        .path(toothPath)
        .direction(toothAngle)
        .line(toothTopLineLength)
        .lastPoint()

    var toothPitchStraightLengthOnCircle = path.distance(startPoint, endPoint);
    var gearRadius = (toothPitchStraightLengthOnCircle / 2) / Math.sin((Math.PI / 180) * toothAngle);

    var gearStartPoint = [0, gearRadius];
    var startAngle = 2 * Math.asin((bottomLength/2) / gearRadius) * 180 / Math.PI;
    startAngle = path.getAngle(gearStartPoint, path.getPointAtAngle(atPosition, gearRadius, startAngle)) - toothAngle;

    var gearPath = (new Path())
        //.start()
        //.line([0, gearRadius])
        .start(gearStartPoint)
        //.direction(90-toothAngle/2)
        .direction(startAngle, true)

    for (var toothIndex = 1; toothIndex <= toothNumber; toothIndex++) {
        var currentAngle = (toothIndex / toothNumber) * 360;
        var point = path.getPointAtAngle(atPosition, gearRadius, currentAngle);

        gearPath
          .direction(toothAngle)
          .path(toothPath)
          .line(point)
    }

    gearPath.info = {
        radius: gearRadius,
        radiusBottom: gearRadius - toothDepth
    }

    return gearPath;
}

function getCircle(radius, atPosition) {
    atPosition = atPosition || [0, 0];
    var startPoint = [atPosition[0], atPosition[1] + radius];
    return (new Path())
        .start(startPoint)
        .direction(90)
        .arc(radius, 180)
        .arc(radius, 180)
}

//szprychy
function movePointByPoint(point, byPoint) {
    if (!byPoint) return point;
    return [point[0]+byPoint[0], point[1] + byPoint[1]];
}
function getSpokes(spokesNumber, length, thickness, atPosition) {
    var spokes = new Path()
    var path = spokes;
    
    var bottomLeft = [-thickness/2, 0];
    var bottomRight = [thickness/2, 0];

    var topLeft = [-thickness/2, length];
    var topRight = [thickness/2, length];
    var startPoint = topLeft;

    var angle = 360 / spokesNumber;
    
    var rotated = path.getRotatedPoints([bottomLeft, topLeft], angle)
    var crossPoint = path.getLinesIntersectionPoint(bottomRight, topRight, rotated[0], rotated[1])
    
    path
        .start(movePointByPoint(topLeft, atPosition))
        .line(movePointByPoint(topRight, atPosition))
        .line(movePointByPoint(crossPoint, atPosition))
    
    var points, pointsToRotate = [topLeft, topRight, crossPoint];
    
    for (var index = 1; index < spokesNumber; index++) {
        points = path.getRotatedPoints(pointsToRotate, (index/spokesNumber) * 360)
        path
            .line(movePointByPoint(points[0], atPosition))
            .line(movePointByPoint(points[1], atPosition))
            .line(movePointByPoint(points[2], atPosition))

    }
    
    return path.line(movePointByPoint(startPoint, atPosition));
}
//ścięty stożek
function getTruncCone(radiusBottom, radiusTop, thickness, cornerBottom, cornerTop, quality) {
    quality = quality || 0.2;
    cornerBottom = cornerBottom || 0;
    cornerTop = cornerTop || 0;
    
    var cone = (new Path())
        .start()
        .line([radiusBottom, 0])

    if (cornerBottom) {
        cone
            .line([radiusBottom, cornerBottom])
            .round(cornerBottom)
    }

    if (cornerTop) {
        cone
            .line([radiusTop, thickness - cornerTop])
            .round(cornerTop)
    }

    cone
        .line([radiusTop, thickness])
        .line([0, thickness])
        .line([0, 0])


    if (radiusBottom > radiusTop) {
        var cornersNumber = Math.ceil(radiusBottom *2 * Math.PI / quality);
    } else {
        var cornersNumber = Math.ceil(radiusTop *2 * Math.PI / quality);        
    }


    return rotate_extrude({fn: cornersNumber}, polygon({points: cone.toJsCad(quality)}) );
}



function Layers() {
    var me = this;

    var heightStart = 0;
    var heightEnd = 0;

    var heightStartPositive = 0;
    var heightEndPositive = 0;

    var lastThikness = 0;
    var currentThikness = 0;

    var instructions = [];
    var postponed = {};
    var waitForPostponed = {};
    var namedValues = {};
    var postponedNamedValues = {};

    function setNamedValue (value, name, nameForStop) {
            var values;
            if (nameForStop) {
                values = postponedNamedValues[nameForStop];
                if (!values) {
                    values = postponedNamedValues[nameForStop] = {};
                }
            } else {
                values = namedValues
            }

            if (values[name] instanceof Array) {
                values[name].push(value);
            } else if (values[name] === undefined) {
                values[name] = value;
            } else {
                values[name] = [values[name], value];
            }
    }

    this.storeStart = function (name, nameForStop) {
        if (name) {
            setNamedValue(heightStart, name, nameForStop);
        }
        return me;
    }

    this.storeEnd = function (name, nameForStop) {
        if (name) {
            setNamedValue(heightEnd, name, nameForStop);
        }
        return me;
    }


    this.from = function (height) {
        heightStart = heightEnd = height;
        return me;
    }
    
    this.thick = function (thicknessOrDepthDiff, thickness) {
        if (thickness !== undefined) {
            if (lastThikness < 0) {
                heightStart = heightStartPositive;
                heightEnd = heightEndPositive;
            }


            heightStart = heightEnd + thicknessOrDepthDiff;
            heightEnd = heightStart + thickness;
            lastThikness = currentThikness = Math.abs(thickness);
        } else {
            if (thicknessOrDepthDiff < 0) {
                if (lastThikness >= 0) {
                    heightStartPositive = heightStart;
                    heightEndPositive = heightEnd;
                }

                currentThikness = -thicknessOrDepthDiff;
                
                var heightStartBackup = heightStart;
                heightStart = heightEnd + thicknessOrDepthDiff;
                heightEnd = heightStartBackup;

            } else {
                if (lastThikness < 0) {
                    heightStart = heightStartPositive;
                    heightEnd = heightEndPositive;
                }
                currentThikness = thicknessOrDepthDiff;
                heightStart = heightEnd;
                heightEnd = heightStart + thicknessOrDepthDiff;
            }


            lastThikness = thicknessOrDepthDiff;
        }
        return me;
    }


    function addInstruction(element, pointAt, type, nameForStop) {
        var newInstruction;
        if (nameForStop) {
            newInstruction = {
                    type: type,
                    at: pointAt,
                    element: element,
                    start: heightStart
                }
            if (postponed[nameForStop]) {
                postponed[nameForStop].push(newInstruction);
            } else {
                postponed[nameForStop] = [newInstruction];
            }
        } else {
            newInstruction = {
                type: type,
                at: pointAt,
                element: element,
                start: heightStart,
                end: heightEnd,
                thick: currentThikness
            };
            if (typeof element === 'function') {
                newInstruction.element = element(newInstruction, namedValues, heightStart, heightEnd, currentThikness);
            }
            instructions.push(newInstruction);
        }
    }

    this.add = function (element, nameForStop, pointAt) {
        if (!pointAt) {
            pointAt = [0, 0];
        }

        addInstruction(element, pointAt, 'add', nameForStop)
        return me;
    }
    
    this.remove = function (element, nameForStop, pointAt) {
        if (!pointAt) {
            pointAt = [0, 0];
        }

        addInstruction(element, pointAt, 'remove', nameForStop)
        return me;
    }

    this.include = function (callback) {
        callback(me);
        return me;
    }

    this.stop = function (nameForStop, nameForStopToWaitFor) {
        var elements = postponed[nameForStop];
        var waitFor;
        if (nameForStopToWaitFor) {
            waitFor = waitForPostponed[nameForStopToWaitFor];
            if (!waitFor) {
                waitFor = waitForPostponed[nameForStopToWaitFor] = [];
            }
        }

        for (var index = 0; index < elements.length; index ++) {
            var instruction = elements[index];
            instruction.end = heightEnd;
            instruction.thick = heightEnd - instruction.start;

            if (typeof instruction.element === 'function') {
                instruction.element = instruction.element(instruction, postponedNamedValues[nameForStop], heightStart, heightEnd, currentThikness);
            }

            if (nameForStopToWaitFor) {
                waitFor.push(instruction);
            } else {
                instructions.push(instruction);
            }
        }

        var waitFor = waitForPostponed[nameForStop];
        if (waitFor) {
            for (var index = 0; index < waitFor.length; index++) {
                instructions.push(waitFor[index]);
            }
            delete waitForPostponed[nameForStop];
        }

        delete postponedNamedValues[nameForStop];
        delete postponed[nameForStop];
        return me;
    }


    function prepareJsCadObject(source, quality, asSingleElementFromArray) {
        var at = source.at;
        if (source.element instanceof Array) {
            if (asSingleElementFromArray) {
                var elements = [];
                for (var index = 0; index < source.element.length; index++) {
                    elements.push(prepareJsCadObject({
                        //type: source.type,
                        element: source.element[index],
                        at: source.at,
                        start: source.start,
                        //end: source.end,
                        thick: source.thick
                    }, quality, true));
                }
                return union(elements);
            } else {

                var firstElement = {
                    //type: source.type,
                    element: source.element[0],
                    at: source.at,
                    start: source.start,
                    //end: source.end,
                    thick: source.thick
                };

                firstElement = prepareJsCadObject(firstElement, quality, true);

                var elements = [];
                for (var index = 1; index < source.element.length; index++) {
                    elements.push(prepareJsCadObject({
                        //type: source.type,
                        element: source.element[index],
                        at: source.at,
                        start: source.start,
                        //end: source.end,
                        thick: source.thick
                    }, quality, true));
                }
                if (source.element.length > 1) {
                    return firstElement.subtract(elements);
                } else {
                    return firstElement;
                }

            }

        } else if (source.element && source.element.toJsCadExtrude) {
            return source
                .element
                .toJsCadExtrude(source.thick, quality)
                .translate([at[0], at[1], source.start]);
        } else {
            if (!source.element) {
                console.log(source)
            }
            return source
                .element
                .translate([at[0], at[1], source.start])
        }
    }

    this.toJsCad = function(quality) {
        var index = 0;
        var length = instructions.length;
        var element, currentObject;

        for (; index < length; index++) {
            element = instructions[index];
            if (element.type === 'add') {
                currentObject = prepareJsCadObject(element, quality);
                break;
            }
        }
        

        for (; index < length; index++) {
            element = instructions[index];
            switch (element.type) {
                case 'add':
                    currentObject = currentObject.union(prepareJsCadObject(element, quality));
                    break;
                    
                case 'remove':
                    currentObject = currentObject.subtract(prepareJsCadObject(element, quality));
                    break;
            }
            
        }

        return currentObject;

    }

}

function Path(isPolygonTolerance) {
    isPolygonTolerance = isPolygonTolerance || 0.0001;
    var me = this;
    var points=[];
    var angles=[];
    var anglesConst=[];
    var dimmensions=[];
    var instructions=[];


    function push(destinationArray, sourceArray) {
        var i = 0, length = sourceArray.length;
        for (; i < length; i++) {
            destinationArray.push(sourceArray[i]);
        }
    }

    this.getInternals = function () {
        return {
            points: points,
            angles: angles,
            anglesConst: anglesConst,
            dimmensions: dimmensions,
            instructions: instructions
        }
    }
    
    function getFirstPoint() {
        return points.slice(0, 2);
    }

    function getLastPoint() {
        calculateFirstStage();
        return lastPoint;
    }

    function getDirection() {
        calculateFirstStage();
        return currentDirection;
    }

    function isPolygon(closeIfInTolerance, tolerance) {
        if (tolerance === undefined) tolerance = isPolygonTolerance;
        var fp = getFirstPoint();
        var lp = getLastPoint();
        if (Math.abs(fp[0] - lp[0]) > tolerance) return false;
        if (Math.abs(fp[1] - lp[1]) > tolerance) return false;
        if (closeIfInTolerance) { // for DXF, G-Code and other formats that strictly relies on proper coordinates
          lp[0] = fp[0]; // Make sure path is closed
          lp[1] = fp[1];
        }
        return true;
    }

    function lineToPoint(point) {
        instructions.push('linePoint');
        push(points, point);
    }

    function lineInDirection(length, angle) {
        instructions.push('lineDirection');
        anglesConst.push(angle);
        dimmensions.push(length);
    }

    function start(point) {
        if (!point) point = [0, 0];

        instructions.push('start');
        push(points, point);
        
        me.close = close;
        me.direction = direction;
        me.round = round;
        me.line = line;
        me.arc = arc;
        me.path = path;
        
        me.firstPoint = getFirstPoint;
        me.lastPoint = getLastPoint;
        me.isPolygon = isPolygon;
        ['start'].forEach(function (element) { delete me[element] });
        return me;
    }
    me.start = start;

    function close(closeToStart) {
        if (closeToStart) {
            lineToPoint(getFirstPoint());
        }
        ['close', 'direction', 'line', 'arc', 'round', 'path'].forEach(function (element) { delete me[element] });
        return me;
    }

    function directionRelative(angle) {
        instructions.push('directionRelative');
        anglesConst.push(angle);
    }

    function directionPermanent(angle) {
        instructions.push('directionPermanent');
        angles.push(angle);
    }
    
    function direction(angle, permanent) {
        if (permanent) {
            directionPermanent(angle);
        } else {
            directionRelative(angle);
        }
        return me;
    }

    function round(radius) {
        instructions.push('round');
        dimmensions.push(radius);
        return me;
    }

    function line(pointOrLength, angle, axis) {
        if (axis) {
            if (axis === 'x') { //TODO:
            } else if (axis === 'y') {
            } else {
            }
        } else {
            if (pointOrLength instanceof Array) {
                lineToPoint(pointOrLength);
            } else {
                lineInDirection(pointOrLength, angle || 0);
            }
        }
        return me;
    }
    function arc(radius, angle) { //radiusOrDestinationPointOrCenterPoint, angleOrLength
        instructions.push('arc');
        anglesConst.push(angle);
        dimmensions.push(radius);
        return me;
    }

    function path(pathToInclude, angleOrPoint, options) { //reverse, flip, scale
        var pathFirstStage = pathToInclude.techGetCalculatedFirstStage();

        var pathFirstPoint = pathToInclude.firstPoint();
        var pathLastPoint = pathToInclude.lastPoint();

        if (angleOrPoint instanceof Array) {
            // TODO: 
        } else { // angle
            calculateFirstStage();
            angleOrPoint = angleOrPoint || 0;

            var pathDirection = me.getAngle(pathFirstPoint, pathLastPoint);
            
            var rotateByAngle = (currentDirection - pathDirection) + angleOrPoint;

            var 
              radians = (Math.PI / 180) * rotateByAngle,
              cos = Math.cos(radians),
              sin = Math.sin(radians);

            var x = pathFirstPoint[0];
            var y = pathFirstPoint[1];

            var moveX = (cos * x ) + (sin * y);
            var moveY = (cos * y ) - (sin * x);

            moveX = lastPoint[0] - moveX;
            moveY = lastPoint[1] - moveY;
            
            var point;

            var pathFirstStageIndex = 1;
            var pathFirstStageLength = pathFirstStage.length;
            for (;pathFirstStageIndex < pathFirstStageLength; pathFirstStageIndex++) {
                var pathElement = pathFirstStage[pathFirstStageIndex];
                switch (pathElement.type) {
                    case 'line':
                        point = pathElement.to;
                        x = point[0];
                        y = point[1];
                        
                        lastPoint = [
                            ((cos * x ) + (sin * y)) + moveX,
                            ((cos * y ) - (sin * x)) + moveY
                        ];
                        
                        firstStage.push({
                            type: 'line', 
                            to: lastPoint, 
                            direction: me.normalizeAngle(pathElement.direction + rotateByAngle), 
                            length: pathElement.length
                        });
                    break;
                    case 'arc':
                        point = pathElement.center;
                        x = point[0];
                        y = point[1];
                        var center = [
                            ((cos * x ) + (sin * y)) + moveX,
                            ((cos * y ) - (sin * x)) + moveY
                        ];

                        point = pathElement.to;
                        x = point[0];
                        y = point[1];

                        lastPoint = [
                            ((cos * x ) + (sin * y)) + moveX,
                            ((cos * y ) - (sin * x)) + moveY
                        ];

                        firstStage.push({
                            type: 'arc', 
                            to: lastPoint, 
                            direction: me.normalizeAngle(pathElement.direction + rotateByAngle), 
                            center: center, 
                            angleFrom: me.normalizeAngle(pathElement.angleFrom + rotateByAngle), 
                            angleTo: me.normalizeAngle(pathElement.angleTo + rotateByAngle), 
                            radius: pathElement.radius, 
                            angle: pathElement.angle, 
                            length: pathElement.length
                        });
                    break;
                    case 'round':
                        if (firstStage[firstStage.length-1].type === 'round') {
                            firstStage[firstStage.length-1].radius = pathElement.radius;
                        } else {
                            firstStage.push({
                                type: 'round', 
                                radius: pathElement.radius, 
                                index: firstStage.length
                            });
                        }
                    break;
                }
            }
            currentDirection = me.normalizeAngle(currentDirection + angleOrPoint);
        }
        return me;
    }

    var instructionsPointer = 0;
    var pointsPointer = 0;
    var anglesPointer = 0;
    var anglesConstPointer = 0;
    var dimmensionsPointer = 0;

    var firstStage = [];
    var secondStage;
    var currentDirection = 0;
    var currentPoint;
    var lastPoint;

    function calculateFirstStage() {
        var angle, radius, length;
        var distance = me.distance;

        var instructionsLength = instructions.length;
        for (;instructionsPointer < instructionsLength; instructionsPointer++) {
            switch (instructions[instructionsPointer]) {
                case 'start':
                    lastPoint = [points[pointsPointer], points[pointsPointer+1]]; pointsPointer+=2;
                    firstStage.push({type: 'start', from: lastPoint});
                break;

                case 'directionRelative':
                    angle = anglesConst[anglesConstPointer++];
                    currentDirection = me.normalizeAngle(currentDirection + angle);                    
                break;

                case 'directionPermanent':
                    angle = angles[anglesPointer++];
                    currentDirection = me.normalizeAngle(angle);                    
                break;

                case 'linePoint':
                    currentPoint = [points[pointsPointer], points[pointsPointer+1]]; pointsPointer+=2;
                    currentDirection = me.getAngle(lastPoint, currentPoint);
                    firstStage.push({type: 'line', to: currentPoint, direction: currentDirection, length: distance(currentPoint, lastPoint)});
                    lastPoint = currentPoint;
                break;

                case 'lineDirection':
                    angle = anglesConst[anglesConstPointer++];
                    length = dimmensions[dimmensionsPointer++];
                    currentDirection = me.normalizeAngle(currentDirection + angle);
                    currentPoint = me.getPointAtAngle(lastPoint, length, currentDirection);
                    firstStage.push({type: 'line', to: currentPoint, direction: currentDirection, length: length});
                    lastPoint = currentPoint;
                break;

                case 'arc':
                    angle = anglesConst[anglesConstPointer++];
                    radius = dimmensions[dimmensionsPointer++];


                    var angleFrom, angleTo, center;
                    if (angle < 0) {
                        center = me.getPointAtAngle(lastPoint, radius, currentDirection - 90);
                        angleFrom = currentDirection + 90;
                    } else {
                        center = me.getPointAtAngle(lastPoint, radius, currentDirection + 90);
                        angleFrom = currentDirection - 90;
                    }
                    angleTo = angleFrom + angle;
                    currentDirection = me.normalizeAngle(currentDirection + angle);
                    currentPoint = me.getPointAtAngle(center, radius, angleTo);
                    length = 2 * Math.PI * radius * Math.abs(angle / 360)
                    firstStage.push({type: 'arc', to: currentPoint, direction: currentDirection, center: center, angleFrom: angleFrom, angleTo: angleTo, radius: radius, angle: angle, length: length});
                    lastPoint = currentPoint;
                break;

                case 'round':
                    radius = dimmensions[dimmensionsPointer++];
                    if (firstStage[firstStage.length-1].type === 'round') {
                        firstStage[firstStage.length-1].radius = radius;
                    } else {
                        firstStage.push({type: 'round', radius: radius, index: firstStage.length});
                    }
                break;
            }
        }
    }

    this.techGetCalculatedFirstStage = function() {
        return firstStage;
    }


    function calculateSecondStage() {
        var getPointAtAngle = me.getPointAtAngle;
        var firstStageLength = firstStage.length;
        secondStage = new Array(firstStageLength);
        var index = 0;
        var current, previous, next;
        var previousIndex, nextIndex;
        var correctStart;
        
        var polygon = isPolygon();
        
        for (;index < firstStageLength; index++) {
            current = firstStage[index];
            if (current.type === 'round') {
                if (index === 1) {
                    if (polygon) {
                        previousIndex = firstStageLength - 1;
                        previous = firstStage[previousIndex];
                        if (previous.type === 'round') {
                            previousIndex = firstStageLength - 2;
                            previous = firstStage[previousIndex];
                        }
                        nextIndex = index + 1;
                        next = firstStage[nextIndex];
                        correctStart = 1;
                    } else {
                        secondStage[index] = current;
                        continue;
                    }
                } else if (index === firstStageLength - 1) {
                    if (polygon) {
                        nextIndex = 1;
                        next = firstStage[1];
                        if (next.type === 'round') {
                            secondStage[index] = current;
                            continue;
                        }
                        previousIndex = index - 1;
                        previous = firstStage[previousIndex];
                        correctStart = 2;
                    } else {
                        secondStage[index] = current;
                        continue;
                    }
                } else {
                    previousIndex = index -1;
                    previous = firstStage[previousIndex];
                    nextIndex = index + 1;
                    next = firstStage[nextIndex];
                }
                
                if (previous.type === 'line' && next.type === 'line') {
                    if (previous.direction <= next.direction) {
                        var cornerAngle = (previous.direction + 180) - next.direction;
                    } else {
                        var cornerAngle = (previous.direction - 180) - next.direction;
                    }
                    
                    if (!cornerAngle || cornerAngle === 180) {
                        secondStage[index] = current;
                        continue;
                    }

                    var angleHalf = cornerAngle / 2;
                    var lengthToCenter = current.radius / Math.sin((Math.PI / 180) * Math.abs(angleHalf));
                    var lengthToCut = current.radius / Math.tan((Math.PI / 180) * Math.abs(angleHalf));
                    
                    if (lengthToCut > previous.length || lengthToCut > next.length) {
                        // TODO: add options to maximize corner to available lengths
                        secondStage[index] = current;
                        continue;
                    }
                    
                    var centerDirection = next.direction + angleHalf;
                    if (centerDirection < 0) centerDirection += 360;
                    //console.log(cornerAngle)
                    //console.log(centerDirection)
                    var center = getPointAtAngle(previous.to, lengthToCenter, centerDirection);
                    var endOfArcPoint = getPointAtAngle(previous.to, lengthToCut, next.direction);
                    var previousLineEndPoint = getPointAtAngle(previous.to, lengthToCut, previous.direction - 180);


                    if (cornerAngle < 0) {
                        var angle = -180- cornerAngle;
                    } else if (next.direction < previous.direction) {
                        var angle = cornerAngle;
                    } else {
                        var angle = next.direction - previous.direction;
                    }

                    if (angle < 0) {
                        var angleFrom = previous.direction + 90;
                    } else {
                        var angleFrom = previous.direction - 90;
                    }
                    
                    var newPrevious = {
                        type: 'line', 
                        to: previousLineEndPoint, 
                        direction: previous.direction, 
                        length: previous.length - lengthToCut,
                        origin: previous
                    };
                    var newCurrent = {
                        type: 'arc', 
                        to: endOfArcPoint, 
                        direction: next.direction, 
                        center: center, 
                        angleFrom: angleFrom, 
                        angleTo: angleFrom + angle, 
                        radius: current.radius, 
                        angle: angle, 
                        length: 2 * Math.PI * current.radius * Math.abs(angle / 360),
                        origin: current
                    };
                    var newNext = {
                        type: 'line', 
                        to: next.to, 
                        direction: next.direction, 
                        length: next.length - lengthToCut,
                        origin: next
                    };
                    
                    secondStage[previousIndex] = newPrevious;
                    secondStage[index] = newCurrent;
                    secondStage[nextIndex] = newNext;
                    if (correctStart) {

                        secondStage[0] = {
                            type: 'start', 
                            from: previousLineEndPoint,
                            origin: firstStage[0]
                        };
                        
                        if (correctStart === 2) {
                            secondStage[0].from = endOfArcPoint;
                        }
                        correctStart = false;
                    }

                } else {
                    secondStage[index] = current;
                }
            } else {
                secondStage[index] = current;
            }
        }
    }

    this.getAssembly = function () {
        calculateFirstStage();
        calculateSecondStage();
        return secondStage;
    }
    
    this.getMinMax = function () {
        calculateFirstStage();
        calculateSecondStage();
        
        var xMin = Number.MAX_VALUE;
        var yMin = Number.MAX_VALUE;
        var xMax = Number.MIN_VALUE;
        var yMax = Number.MIN_VALUE;
        
        var element, point;
        var index = 0;
        var length = secondStage.length;
        for (;index < length; index++) {
            element = secondStage[index];
            point = element.to;
            if (point) {
                if (point[0] < xMin) {
                    xMin = point[0];
                } else if (point[0] > xMax) {
                    xMax = point[0];
                }

                if (point[1] < yMin) {
                    yMin = point[1];
                } else if (point[1] > yMax) {
                    yMax = point[1];
                }
            }
            
            point = element.from;
            if (point) {
                if (point[0] < xMin) {
                    xMin = point[0];
                } else if (point[0] > xMax) {
                    xMax = point[0];
                }

                if (point[1] < yMin) {
                    yMin = point[1];
                } else if (point[1] > yMax) {
                    yMax = point[1];
                }
            }
            
            if (element.type === 'arc') {
                var angleCurrent;
                var angleIncrement
                if (element.angle < 0) {
                    angleCurrent = Math.floor(element.angleFrom / 90) * 90;
                    angleIncrement = -90;
                } else {
                    angleCurrent = Math.ceil(element.angleFrom / 90) * 90;
                    angleIncrement = 90;
                }
                var angleTo = element.angle + element.angleFrom;
                for (;angleCurrent < angleTo; angleCurrent += angleIncrement) {
                    point = getPointAtAngle(element.center, element.radius, angleCurrent);
                    if (point) {
                        if (point[0] < xMin) {
                            xMin = point[0];
                        } else if (point[0] > xMax) {
                            xMax = point[0];
                        }

                        if (point[1] < yMin) {
                            yMin = point[1];
                        } else if (point[1] > yMax) {
                            yMax = point[1];
                        }
                    }

                }
            }
            
        }
        return {
            from: [xMin, yMin],
            to: [xMax, yMax]
        }
    }
}

Path.prototype.distance = function(pointA, pointB) {
    var ax = pointA[0];
    var ay = pointA[1];
    var bx = pointB[0];
    var by = pointB[1];
    
    if (ax === bx) {
        return Math.abs(ay - by);
    } else if (ay === by) {
        return Math.abs(ax - bx);
    }
    var xd = ax - bx;
    var yd = ay - by;
    return Math.sqrt(xd*xd + yd*yd);
}

Path.prototype.normalizeAngle = function(angle) {
    angle %= 360;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}

Path.prototype.getAngle = function(pointA, pointB) {
    if (pointA[0] === pointB[0]) {
        if (pointA[1] < pointB[1]) {
            return 0;
        } else {
            return 180;
        }
    } else if (pointA[1] === pointB[1]) {
        if (pointA[0] < pointB[0]) {
            return 90;
        } else {
            return 270;
        }
    } else {
        var dx = pointB[0] - pointA[0];
        var dy = pointB[1] - pointA[1];
        var angle = Math.atan(dx/dy) * 180 / Math.PI;
        if (dx > 0) {
            if (dy < 0) {
                angle += 180;
            }
        } else {
            if (dy < 0) {
                angle += 180;
            } else {
                angle += 360;
            }
        }
        return angle;
    }
}

Path.prototype.getLinesIntersectionPoint = function(pointA1, pointA2, pointB1, pointB2) {
    var x1 = pointA1[0];
    var x2 = pointA2[0];
    var x3 = pointB1[0];
    var x4 = pointB2[0];

    var y1 = pointA1[1];
    var y2 = pointA2[1];
    var y3 = pointB1[1];
    var y4 = pointB2[1];

    var deltaXA = x1-x2;
    var deltaXB = x3-x4;
    var deltaYA = y1-y2;
    var deltaYB = y3-y4;

    var divider = (deltaXA*deltaYB-deltaYA*deltaXB);
    var factorA = x1*y2-y1*x2;
    var factorB = x3*y4-y3*x4;

    return [
        (factorA*deltaXB-deltaXA*factorB)/divider,
        (factorA*deltaYB-deltaYA*factorB)/divider
    ]

}

Path.prototype.getPointAtAngle = function (centralPoint, radius, angle) {
    var cx = centralPoint[0],
        cy = centralPoint[1],
        radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians);

    return [
        (sin * radius) + cx,
        (cos * radius) + cy
    ];
}

Path.prototype.getRotatedPoints = function(pointOrPoints, angle, centralPoint) {
    if (!centralPoint) centralPoint = [0, 0];
    var cx = centralPoint[0],
        cy = centralPoint[1],
        radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians);

    var x = pointOrPoints[0];
    if (x instanceof Array) {
        var result = [];
        var index = 0, y;
        for (; index < pointOrPoints.length; index++) {
             x = pointOrPoints[index][0];
             y = pointOrPoints[index][1];
             result.push([
                (cos * (x - cx)) + (sin * (y - cy)) + cx,
                (cos * (y - cy)) - (sin * (x - cx)) + cy
             ]);
        }
        return result
    } else {
        var y = pointOrPoints[1];
        return [
            (cos * (x - cx)) + (sin * (y - cy)) + cx,
            (cos * (y - cy)) - (sin * (x - cx)) + cy
        ];
    }
}

Path.prototype.getRadiusByLengthOfLineAndAngle = function (lenghtOfLineCrossingCircle, angle) {
    return (lenghtOfLineCrossingCircle / 2) / Math.sin((Math.PI / 180) * (angle / 2));
}

Path.prototype.getAngleByLengthOfLineAndRadius = function (lenghtOfLineCrossingCircle, radius) {
    return 2 * Math.asin((lenghtOfLineCrossingCircle/2) / radius) * 180 / Math.PI;
}

Path.prototype.toString = function(windowSize, fontSize) {
}
Path.prototype.toJsCad = function(quality) {
    quality = quality || 0.2;
    var getPointAtAngle = this.getPointAtAngle;
    var assembly = this.getAssembly();
    //console.log(assembly)

    var result = [];

    var element;
    var elementAngle;
    var elementAngleFrom;
    var elementCenter;
    var elementRadius;
    var elementLength;
    var elementIterations;
    var elementIndex;

    var index = 0, element;
    var length = assembly.length;

    for (;index < length; index++) {
        element = assembly[index];

        switch (element.type) {
            case 'start':
                result.push(element.from)
            break;

            case 'line':
                result.push(element.to)
            break;

            case 'arc':
                elementAngle = element.angle;
                elementAngleFrom = element.angleFrom;
                elementCenter = element.center;
                elementRadius = element.radius;
                elementLength = element.length;

                elementIterations = Math.ceil(elementLength / quality);
                elementIndex = 1;
                for (;elementIndex <= elementIterations; elementIndex++) {
                    result.push(getPointAtAngle(elementCenter, elementRadius, elementAngleFrom + ((elementIndex/elementIterations) * elementAngle)));
                }
                result.push(element.to);
            break;
        }
    }
    if (this.isPolygon()) {
        result.pop();
    }
    return result;
}

Path.prototype.toJsCadRotateExtrude = function(quality) {
        var radius = this.getMinMax().to[0];

        var cornersNumber = Math.ceil(radius *2 * Math.PI / quality);
        if (cornersNumber < 3) {
            cornersNumber = 3;
        }
        var points2D = this.toJsCad(quality);
        var points = [];
        var triangles = [];
        
        var index, point;
        var length = points2D.length;
        for (index = 0; index < length; index++) {
            point = points2D[index];
            points.push([point[0], 0, point[1]])
        }
        
        var angleIndex;
        for (angleIndex = 1; angleIndex < cornersNumber; angleIndex++) {
            var angle = (angleIndex / cornersNumber) * 360;
            var radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                mSin = -Math.sin(radians);
            for (index = 0; index < length; index++) {
                point = points2D[index];
                points.push([
                    (cos * point[0]),
                    (mSin * point[0]),
                    point[1]
                ]);
            }
        }
        var currentLeftIndex, currentRightIndex;
        var previousLeftIndex = length - 1;
        var previousRightIndex = previousLeftIndex + length;
        
        var currentLeft, currentRight;
        var previousLeft = points[previousLeftIndex];
        var previousRight = points[previousRightIndex];
        
        for (currentLeftIndex = 0, currentRightIndex = length; currentRightIndex < points.length; currentLeftIndex++, currentRightIndex++) {
            currentLeft = points[currentLeftIndex];
            currentRight = points[currentRightIndex];
            
            if (!currentLeft[0]) {
                if (previousLeft[0]) {//trójkąt
                    triangles.push([currentLeftIndex, previousRightIndex, previousLeftIndex]);
                }
            } else if (!previousLeft[0]) {
                if (currentLeft[0]) {//trójkąt
                    triangles.push([currentLeftIndex, currentRightIndex, previousRightIndex]);
                }
            } else { //czworokąt
                triangles.push([currentLeftIndex, previousRightIndex, previousLeftIndex]);
                triangles.push([currentLeftIndex, currentRightIndex, previousRightIndex]);
            }
            
            previousLeft = currentLeft;
            previousRight = currentRight;
            previousLeftIndex = currentLeftIndex;
            previousRightIndex = currentRightIndex;
        }

        for (currentRightIndex = 0; currentLeftIndex < points.length; currentLeftIndex++, currentRightIndex++) {
            currentLeft = points[currentLeftIndex];
            currentRight = points[currentRightIndex];
            
            if (!currentLeft[0]) {
                if (previousLeft[0]) {//trójkąt
                    triangles.push([currentLeftIndex, previousRightIndex, previousLeftIndex]);
                }
            } else if (!previousLeft[0]) {
                if (currentLeft[0]) {//trójkąt
                    triangles.push([currentLeftIndex, currentRightIndex, previousRightIndex]);
                }
            } else { //czworokąt
                triangles.push([currentLeftIndex, previousRightIndex, previousLeftIndex]);
                triangles.push([currentLeftIndex, currentRightIndex, previousRightIndex]);
            }
            
            previousLeft = currentLeft;
            previousRight = currentRight;
            previousLeftIndex = currentLeftIndex;
            previousRightIndex = currentRightIndex;
        }

        return polyhedron({
            points: points,
            triangles: triangles
        });
        
}

Path.prototype.toJsCadExtrude = function (heightOrRotate, quality, forcePresentation) {
    quality = quality || 0.2;
    var isPolygon = this.isPolygon(true, quality / 10);
    //console.log(this.toJsCad(quality))
    
    // first creating a 2D path, and then extrude it

    if (isPolygon && !forcePresentation) {
      if (heightOrRotate === true) {
        
        //var radius = this.getMinMax().to[0];

        //var cornersNumber = Math.ceil(radius *2 * Math.PI / quality);
        //if (cornersNumber < 3) {
        //    cornersNumber = 3;
        //}
        //var points = this.toJsCad(quality);

        //return rotate_extrude({fn: cornersNumber}, polygon({points: points}) );
        return this.toJsCadRotateExtrude(quality);
      } else {
        var shape = CAG.fromPoints(this.toJsCad(quality));
        return linear_extrude({ height: heightOrRotate }, shape);
      }
    } else {
      var path = new CSG.Path2D(this.toJsCad(quality), /*closed=*/isPolygon);
      return path.rectangularExtrude(0.1, heightOrRotate, quality, false);   // w, h, resolution, roundEnds
    }
}

function main() {

    return getElement();
}

/*
if (!CAG) {
    var CAG = {
        fromPoints: function(){return CAG},
        translate: function(){return CAG},
        union: function(){return CAG},
        subtract: function(){return CAG}
    }
    var linear_extrude = function(){return CAG};
    var difference = function(){return CAG};
    var rotate_extrude = function(){return CAG};
    var polygon = function(){return CAG};
    main()
}


*/
