import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Search } from "lucide-react"

export default function SearchBar() {
  return (
    <div className="mb-8">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search for articles or solutions..."
          className="w-full pl-10 pr-4 py-2 bg-[#333533] text-[#E0E0E0] border-[#6A4C93] focus:border-[#9B5DE5] focus:ring-[#9B5DE5]"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A9A9A9]" />
        <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#9B5DE5] hover:bg-[#6A4C93] text-white">
          Search
        </Button>
      </div>
    </div>
  )
}
