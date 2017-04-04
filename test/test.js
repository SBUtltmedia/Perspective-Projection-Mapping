var realOrderPoints = [
    [0.2908355050629197, 0.644665000100760], // 0
    [0.4975054795604854, 0.606452937014772], // 1
    [0.3036731145136822, 0.365250418155803], // 2
    [0.4976877521637637, 0.276594389044925], // 3
    [0.7098655613684729, 0.644041915810630], // 4
    [0.5017728817543318, 0.671290203754576], // 5
    [0.6969444100477866, 0.363786872907236], // 6
    [0.5016788268098611, 0.428357748114594], // 7        DEL
]

var vertexPoints = [
    [0.5011, 0.6064], // A
    [0.6334, 0.6445], // B
    [0.6252, 0.3650], // C
    [0.5010, 0.2765], // D
    [0.3662, 0.6441], // E
    [0.3744, 0.3639], // F
    [0.4991, 0.6713], // G
]




var reorderArray = calculateReorderPoints(realOrderPoints, vertexPoints);
var updatedPts = updatePts(vertexPoints, realOrderPoints, reorderArray);
console.log(updatedPts);
// console.log(realOrderPoints);
// console.log(vertexPoints);



function updatePts(vertexPoints, realOrderPoints, reorderArray) {
    var updatedPts = [];
    reorderArray.forEach(function(val, index, array) {
        updatedPts.push(realOrderPoints[reorderArray[index]]);
    });
    return updatedPts;
}



function calculateReorderPoints(realOrderPoints, vertexPoints) {
    var distanceArr = [];
    realOrderPoints.pop();
    realOrderPoints.forEach(function(val, index, array) {
        var minVal = 1000;
        var minIndex = 0;
        vertexPoints.forEach(function(val2, index2, array2) {
            var totalDist = Math.abs(val[0] - val2[0]) + Math.abs(val[1] - val2[1]);
            if (totalDist < minVal) {
                minVal = totalDist;
                minIndex = index2;
            }
        });
        distanceArr.push(minIndex);
    });
    return distanceArr;
}







/*
PROBLEM:
// 1) Get array sequence with minimum deltas
// 2) Remap
// ** Note: Ensure no point gets used twice.


// INPUT:
var realOrderPoints = [
    [0.2908355050629197, 0.644665000100760],        // 0
    [0.4975054795604854, 0.606452937014772],        // 1
    [0.3036731145136822, 0.365250418155803],        // 2
    [0.4976877521637637, 0.276594389044925],        // 3

    [0.7098655613684729, 0.644041915810630],        // 4
    [0.5017728817543318, 0.671290203754576],        // 5
    [0.6969444100477866, 0.363786872907236],        // 6
    [0.5016788268098611, 0.428357748114594],        // 7        DEL
]

var vertexPoints = [
    [0.5011, 0.6064], // A
    [0.6334, 0.6445], // B
    [0.6252, 0.3650], // C
    [0.5010, 0.2765], // D

    [0.3662, 0.6441], // E
    [0.3744, 0.3639], // F
    [0.4991, 0.6713], // G
]




> 4 0 5 3 1 6 2



OUTPUT:
var reorderArr = [
    [0.7098655613684729, 0.644041915810630],        // 4
    [0.2908355050629197, 0.644665000100760],        // 0
    [0.5017728817543318, 0.671290203754576],        // 5
    [0.4976877521637637, 0.276594389044925],        // 3
    [0.4975054795604854, 0.606452937014772],        // 1
    [0.6969444100477866, 0.363786872907236],        // 6
    [0.3036731145136822, 0.365250418155803],        // 2
]





// BASE CASE:
0   -> E
1   -> A
2   -> F
3   -> D
4   -> B
5   -> G
6   -> C
7   -> _

*/
