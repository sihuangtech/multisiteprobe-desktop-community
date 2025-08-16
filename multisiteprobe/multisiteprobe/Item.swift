//
//  Item.swift
//  multisiteprobe
//
//  Created by 斯黄 on 2025/8/16.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
