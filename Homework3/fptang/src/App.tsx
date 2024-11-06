import Example from './components/Example'
import Notes from './components/Notes'
import { NotesWithReducer, CountProvider } from './components/NotesWithReducer';
import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import HeatMap from './components/HeatMap'
import PieChart from './components/BoxPlot';
import PolyChart from './components/PolyChart';
import './App.css';

function App() {
  return (
    <div className="dashboard">
      <div className="dashboard-item">
        <h1>Overview View: Distribution of Scores</h1>
        <HeatMap />
        <p className="chart-description">
        Each cell in the heatmap, shows a combination of G1 (score for the first grading period) and G3 (final grade) 
        scores. The color intensity of each cell would indicate the number of students who received that specific 
        combination of initial (G1) and final (G3) scores.
        </p>
      </div>
      <div className="dashboard-item">
        <h1>Focus View: Study Time Distribution</h1>
        <PieChart />
        <p className="chart-description">
        The box-plot X-axis represents different hours of study time (with values like 1, 2, 3, and 4), 
        and the Y-axis represents final grades (ranging from 0 to 20). 
        </p>
      </div>
      <div className="dashboard-item">
        <h1>Detailed View: Line Chart</h1>
        <PolyChart />
        <p className="chart-description">
        This chart displays the relationship between students’ study time hours and their final grades, 
        with lines connecting data points across study hours (1-4) for each group, such as gender.
        </p>
      </div>

      <div>
      <h1>Observation:</h1>
      <ol>
        <li>There is a clear positive correlation between G1 and G3. Darker cells that indicating higher concentration of 
        students with specific score combinations are around the middle scores (10-15). Lighter cells are around extremely 
        low or extremely high</li>
        <li>The median grade tends to increase slightly 
        from study time level 1 to level 4, indicating a possible positive correlation between study time and median 
        grade, although the increase is subtle. However, the effect is not strong, and there is considerable variability 
        in scores within each study time category. Other factors beyond study time might influence performance, 
        as grades vary significantly even among students with the same study time level.</li>
        <li>
        Female may show a more consistent improvement with increased study time, while the other displays 
        more variability or inconsistency across study levels.The overlapping lines suggest 
        that some students’ performance fluctuates significantly across study levels, 
        possibly indicating varying levels of effectiveness in study habits. Lines that consistently appear at higher or 
        lower final grade levels across all study times could represent high or low-performing groups, respectively.
        </li>
      </ol>
      </div>

      <div>
        <h1>Conclusion:</h1>
        <p>
        The user, likely an educator, student, or researcher, seeks to understand how study time and initial 
        performance influence final grades. The three charts are connected in a logical progression, allowing the 
        user to start with the heat map to gain a high-level understanding of the distribution and 
        correlation between initial (G1) and final (G3) scores. They then transition to the box plot
        to explore how different study times impact final grades, identifying trends or variations that may 
        relate to the patterns seen in the heat map. Lastly, the line chart enables them to examine 
        individual performance patterns by groups, such as gender, which connects back to the initial trends observed 
        in the heat map and box plot. Smooth transitions between views, consistent color schemes, and interactive 
        elements create a cohesive data exploration experience, enabling layered insights.
        </p>
      </div>
      

    </div>
  );
}

export default App
