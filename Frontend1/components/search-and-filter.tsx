"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

interface FilterOptions {
  status?: string
  priority?: string
  category?: string
  dateRange?: string
  location?: string
  assignedTo?: string
}

interface SearchAndFilterProps {
  onSearch: (query: string) => void
  onFilter: (filters: FilterOptions) => void
  placeholder?: string
  showAdvanced?: boolean
}

export function SearchAndFilter({
  onSearch,
  onFilter,
  placeholder = "Search...",
  showAdvanced = false,
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value === "all" ? undefined : value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter({})
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 hover-glow"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-slate-600 text-slate-300 hover:text-white btn-animate"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && <Badge className="ml-2 bg-blue-500 text-white text-xs">{activeFilterCount}</Badge>}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <Select onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <Select onValueChange={(value) => handleFilterChange("priority", value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <Select onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showAdvanced && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
                <Select onValueChange={(value) => handleFilterChange("dateRange", value)}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-700/50">
              <span className="text-sm text-slate-400">Active filters:</span>
              {Object.entries(filters).map(
                ([key, value]) =>
                  value && (
                    <Badge key={key} variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {key}: {value}
                      <button
                        onClick={() => handleFilterChange(key as keyof FilterOptions, "all")}
                        className="ml-1 hover:text-blue-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ),
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-white">
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
