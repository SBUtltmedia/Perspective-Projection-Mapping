// coordinates update with movement
// var pts = [
//     [0.2908355050629197, 0.644665000100760], // 0
//     [0.4975054795604854, 0.606452937014772], // 1
//     [0.3036731145136822, 0.365250418155803], // 2
//     [0.4976877521637637, 0.276594389044925], // 3
//     [0.7098655613684729, 0.644041915810630], // 4
//     [0.5017728817543318, 0.671290203754576], // 5
//     [0.6969444100477866, 0.363786872907236], // 6
//     [0.5016788268098611, 0.428357748114594], // 7        DEL
// ];

// var vertexPts = [
//     [0.5011, 0.6064], // A
//     [0.6334, 0.6445], // B
//     [0.6252, 0.3650], // C
//     [0.5010, 0.2765], // D
//     [0.3662, 0.6441], // E
//     [0.3744, 0.3639], // F
//     [0.4991, 0.6713], // G
// ];



// old
// var pts = [
//     [0.2908355050629197, 0.644665000100760], // 0
//     [0.3036731145136822, 0.365250418155803], // 2
//     [0.4976877521637637, 0.276594389044925], // 3
//     [0.4975054795604854, 0.606452937014772], // 1
//     [0.5017728817543318, 0.671290203754576], // 5
//     [0.6969444100477866, 0.363786872907236], // 6
//     [0.7098655613684729, 0.644041915810630], // 4
// ];

var pts = [
        [0.3036092607608212, 0.6441414659033777],
        [0.5016626604309578, 0.6064554847784225],
        [0.31569687373625577, 0.36399039943352096],
        [0.5015411523722868, 0.2765720622854274],
        [0.6959236286502745, 0.644585076694217],
        [0.4988185171541147, 0.6713038942086743],
        [0.6838916934839088, 0.36503238403575655]
]




var vertexPts = [
    [0.507120, 0.638653], //*0
    [0.952325, 0.834875], //*1
    [0.897624, 0.308543], //*2
    [0.499073, 0.039900], //*3
    [0.042908, 0.834260], //*4
    [0.086556, 0.314496], //*5
    [0.491259, 0.982841], //*6
];


// old
// var vertexPts = [
//     [0.3662, 0.6441], // E
//     [0.3744, 0.3639], // F
//     [0.4991, 0.6713], // G
//     [0.5010, 0.2765], // D
//     [0.5011, 0.6064], // A
//     [0.6252, 0.3650], // C
//     [0.6334, 0.6445], // B
// ];





var reorderArray = calculateReorderPoints(pts, vertexPts);
console.log(reorderArray);
console.log("\n\n");

// var updatedPts = updatePts(pts, vertexPts, reorderArray);
var updatedPts = updatePts(vertexPts, pts, reorderArray);




console.log("Vertex Points");
printArr(vertexPts);
console.log("\n\n");



console.log("Points ");
printArr(pts);
console.log("\n\n");



console.log("Updated Points");
printArr(updatedPts);
console.log("\n\n");






function printArr(arr) {
    arr.forEach(function(val, index, array) {
        console.log(arr[index]);
    });
}




function updatePts(vertexPts, pts, reorderArray) {
    var updatedPts = [];

    reorderArray.forEach(function(val, index, array) {
        updatedPts.push(pts[reorderArray[index]]);
    });

    return updatedPts;
}




function calculateReorderPoints(pts, vertexPts) {
    var distanceArr = [];
    var tdi=[]
    //pts.pop();
    pts.forEach(function(val, index, array) {
        var di=[]
        var minVal = 10000000; // .
        var minIndex = 10;
        vertexPts.forEach(function(val2, index2, array2) {
            // var totalDist = Math.abs(val[0] - val2[0]) + Math.abs(val[1] - val2[1]);
            var totalDist = Math.sqrt(Math.pow(val[0] - val2[0], 2) + Math.pow(val[1] - val2[1], 2));
            di.push(totalDist)
            if (totalDist < minVal) {
                minVal = totalDist;
                minIndex = index2;
            }
        });
        tdi.push(di)
        distanceArr.push(minIndex);
    });
    return [distanceArr,tdi];
}





// old
// function calculateReorderPoints(pts, vertexPts) {
//     var distanceArr = [];
//     pts.pop();
//     pts.forEach(function(val, index, array) {
//         var minVal = 1000;
//         var minIndex = 0;
//         vertexPts.forEach(function(val2, index2, array2) {
//             var totalDist = Math.abs(val[0] - val2[0]) + Math.abs(val[1] - val2[1]);
//             if (totalDist < minVal) {
//                 minVal = totalDist;
//                 minIndex = index2;
//             }
//         });
//         distanceArr.push(minIndex);
//     });
//     return distanceArr;
// }
