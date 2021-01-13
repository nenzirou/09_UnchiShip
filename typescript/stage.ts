
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
            dropItemList: []
        },
        {
            name: "アブラカタスター",
            sellList: [[1, 40], [2, 20], [3, 300], [4, 100], [5, 200], [6, 300], [7, 100], [8, 200], [9, 300]],
            questList: [1, 0],
            barList: [1, 0],
            linkList: [[0, 100], [2, 200]],
            dropItemList: []
        },
        {
            name: "機械の星",
            sellList: [[1, 40], [2, 20], [3, 300], [4, 100], [5, 200], [6, 300], [7, 100], [8, 200], [9, 300]],
            questList: [1, 0],
            barList: [1, 0],
            linkList: [[0, 100], [2, 200]],
            dropItemList: []
        },
        {
            name: "発電の星",
            sellList: [[1, 40], [2, 20], [3, 300], [4, 100], [5, 200], [6, 300], [7, 100], [8, 200], [9, 300]],
            questList: [1, 0],
            barList: [1, 0],
            linkList: [[0, 100], [2, 200]],
            dropItemList: []
        },
        {
            name: "ハブ空港の星",
            sellList: [[1, 40], [2, 20], [3, 300], [4, 100], [5, 200], [6, 300], [7, 100], [8, 200], [9, 300]],
            questList: [1, 0],
            barList: [1, 0],
            linkList: [[0, 100], [2, 200]],
            dropItemList: []
        }
    ];
}