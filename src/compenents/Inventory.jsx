export default function Inventory({ items, selected, onSelect }) {
  return (
    <div className="inventory-bar">
      {items.map((item, index) => (
        <div 
          key={item.type}
          className={`slot ${index === selected ? 'active' : ''}`}
          onClick={() => onSelect(index)}
        >
          <img src={texturePaths[item.type]} />
          <span>{item.count}</span>
        </div>
      ))}
    </div>
  )
}