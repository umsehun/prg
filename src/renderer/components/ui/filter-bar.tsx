import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Grid, List, Star, Clock, TrendingUp, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterBarProps {
    viewMode: 'grid' | 'list'
    onViewModeChange: (mode: 'grid' | 'list') => void
    sortBy: string
    onSortChange: (sort: string) => void
    filterBy: string
    onFilterChange: (filter: string) => void
}

export function FilterBar({
    viewMode,
    onViewModeChange,
    sortBy,
    onSortChange,
    filterBy,
    onFilterChange,
}: FilterBarProps) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                    {/* Difficulty Filter */}
                    <Select value={filterBy} onValueChange={onFilterChange}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="All Difficulties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort Options */}
                    <Select value={sortBy} onValueChange={onSortChange}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="title">
                                <div className="flex items-center space-x-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    <span>Title</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="artist">
                                <div className="flex items-center space-x-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    <span>Artist</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="difficulty">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Difficulty</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="rating">
                                <div className="flex items-center space-x-2">
                                    <Star className="h-4 w-4" />
                                    <span>Rating</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="plays">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Play Count</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="recent">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Recently Played</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 rounded-lg border p-1">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('list')}
                        className="h-8 w-8 p-0"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('grid')}
                        className="h-8 w-8 p-0"
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
