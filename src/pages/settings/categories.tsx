import CategoryList from "../../components/categories/category-list"
import CategoryForm from "../../components/categories/category-form"

const CategoriesPage = () => {
	return <>
		<CategoryList type="outcomes"/>
		<CategoryForm type="outcomeCategories" />
		</>
}
export default CategoriesPage
