
interface stageInfo {
    name: string;//この場所の名前
    sellList: number[][];//売り物リスト
    questList: number[];//クエストリスト
    barList: number[];//小話リスト
    linkList: number[][];//接続リスト
    dropItemList: number[][];//ドロップアイテムリスト
}

export class Stage {
    static stageInfo: stageInfo[] = [
        {
            name: "始まりの星",
            sellList: [[5, 50], [19, 25]],
            questList: [],
            barList: [],
            linkList: [[1, 100]],
            dropItemList: [[0, 0.5], [6, 0.45], [2, 0.05]]
        },
        {
            name: "油田の星",
            sellList: [[5, 50], [19, 25]],
            questList: [1, 0],
            barList: [1, 0],
            linkList: [[0, 100], [2, 100]],
            dropItemList: [[0, 0.5], [6, 0.4], [2, 0.1]]
        },
        {
            name: "機械の星",
            sellList: [[5, 50], [19, 25]],
            questList: [1, 0],
            barList: [1, 0],
            linkList: [[1, 100], [3, 150], [4, 150]],
            dropItemList: []
        },
        {
            name: "発電の星",
            sellList: [[5, 50], [19, 25]],
            questList: [1, 0],
            barList: [1, 0],
            linkList: [[2, 150], [4, 150]],
            dropItemList: []
        },
        {
            name: "ハブ空港の星",
            sellList: [[5, 50], [19, 25]],
            questList: [1, 0],
            barList: [1, 0],
            linkList: [[2, 150], [3, 150]],
            dropItemList: []
        }
    ];
}